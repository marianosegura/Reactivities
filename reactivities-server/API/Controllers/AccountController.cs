using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using API.DTOs;
using API.Services;
using Domain;
using Infrastructure.Email;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]  // api/account
    public class AccountController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        public TokenService _tokenService;
        private readonly EmailSender _emailSender;

        public AccountController(UserManager<AppUser> userManager, 
            SignInManager<AppUser> signInManager,
            TokenService tokenService,
            EmailSender emailSender)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _tokenService = tokenService;
            _emailSender = emailSender;
        }


        [AllowAnonymous]
        private UserDto CreateUserObject(AppUser user)  // refactored (+3 duplication is not ok)
        {
            return new UserDto { 
                DisplayName = user.DisplayName, 
                Image = user?.Photos?.FirstOrDefault(x => x.IsMain)?.Url, 
                Token = _tokenService.CreateToken(user), 
                Username = user.UserName 
            };
        }


        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userManager.Users
                .Include(p => p.Photos)
                .FirstOrDefaultAsync(x => x.Email == loginDto.Email);
            if (user == null) return Unauthorized("Invalid email");

            if (user.UserName == "bob") user.EmailConfirmed = true;  // only exception
            if (!user.EmailConfirmed) return Unauthorized("Email not confirmed");
            
            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
            if (!result.Succeeded) return Unauthorized("Invalid password");

            await SetRefreshToken(user);  // refresh token
            return CreateUserObject(user);
        }


        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            if (await _userManager.Users.AnyAsync(x => x.Email == registerDto.Email ))
            {
                ModelState.AddModelError("email", "Email taken");  // ModelState is a global object where we can store validation error messages
                return ValidationProblem();  // ValidationProblem returns with the data inside ModelState
            };
            
            if (await _userManager.Users.AnyAsync(x => x.UserName == registerDto.Username ))
            {
                ModelState.AddModelError("username", "Username taken");
                return ValidationProblem();
            };

            var user = new AppUser
            {
                DisplayName = registerDto.DisplayName,
                Email = registerDto.Email,
                UserName = registerDto.Username,
            };

            var registerResult = await _userManager.CreateAsync(user, registerDto.Password); 
            if (!registerResult.Succeeded) return BadRequest("Problem registering user");

            var origin = Request.Headers["origin"];
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));  // encode from html string

            var verifyUrl = $"{origin}/account/verifyEmail?token={token}&email={user.Email}";
            var emailBody = $"<p>Please click the below link to verify your email address:</p><p><a href='{verifyUrl}'>Click to verify email</a></p>";
            await _emailSender.SendEmailAsync(user.Email, "Please verify your Reactivities email", emailBody);
            
            
            return Ok("Registration success - please verify email");
            // await SetRefreshToken(user);  // refresh token
            // return CreateUserObject(user);
        }


        [Authorize]  
        [HttpGet]  // user from token
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {  // User is created from the user token, referes to the current authorized user"
            var user = await _userManager.Users
                .Include(p => p.Photos)
                .FirstOrDefaultAsync(x => x.Email == User.FindFirstValue(ClaimTypes.Email));
            await SetRefreshToken(user);  // refresh token
            return CreateUserObject(user); 
        }


        private async Task SetRefreshToken(AppUser user)
        {
            var refreshToken = _tokenService.GenerateRefreshToken();
            user.RefreshTokens.Add(refreshToken);
            await _userManager.UpdateAsync(user);
            
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7)
            };
            Response.Cookies.Append("refreshToken", refreshToken.Token, cookieOptions);
        }


        [Authorize]
        [HttpPost("refreshToken")]
        public async Task<ActionResult<UserDto>> RefreshToken()  // to refresh token before expiry
        {  // don't understand actually how it works if we are not calling SetRefreshToken, we are just revoking
            var refreshToken = Request.Cookies["refreshToken"];
            var user = await _userManager.Users
                .Include(p => p.Photos)
                .Include(p => p.RefreshTokens)
                .FirstOrDefaultAsync(x => x.Email == User.FindFirstValue(ClaimTypes.Email));
            if (user == null) return Unauthorized();

            var oldToken = user.RefreshTokens.SingleOrDefault(x => x.Token == refreshToken);
            if (oldToken != null && !oldToken.IsActive) return Unauthorized();

            if (oldToken != null) oldToken.Revoked = DateTime.UtcNow;

            return CreateUserObject(user);
        }


        [AllowAnonymous]
        [HttpPost("verifyEmail")]
        public async Task<IActionResult> VerifyEmail(string token, string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return Unauthorized();

            var decodedTokenBytes = WebEncoders.Base64UrlDecode(token);
            var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);
            var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

            if (!result.Succeeded) return BadRequest("Could not verify email address");
            return Ok("Email confirmed - you can now login");
        }


        [AllowAnonymous]
        [HttpGet("resendEmailConfirmationLink")]
        public async Task<IActionResult> ResendEmailConfirmationLink(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return Unauthorized();

            var origin = Request.Headers["origin"];
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));  // encode from html string

            var verifyUrl = $"{origin}/account/verifyEmail?token={token}&email={user.Email}";
            var emailBody = $"<p>Please click the below link to verify your email address:</p><p><a href='{verifyUrl}'>Click to verify email</a></p>";
            await _emailSender.SendEmailAsync(user.Email, "Please verify your Reactivities email", emailBody);
            return Ok("Email verification link resent");
        }
    }
    }

