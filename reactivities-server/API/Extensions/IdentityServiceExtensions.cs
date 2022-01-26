using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Domain;
using Persistence;
using Microsoft.AspNetCore.Identity;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;

namespace API.Extensions
{
    public static class IdentityServiceExtensions
    {
        public static IServiceCollection AddIdentityServices(this IServiceCollection services,  // extension method, can be called in a IServiceCollection object
            IConfiguration config) 
        {
            services.AddIdentityCore<AppUser>(opt => 
            {  // here is the real configuration, like required password 
                opt.Password.RequireNonAlphanumeric = false;
                opt.SignIn.RequireConfirmedEmail = true;  // required email confirmation
            })
            .AddEntityFrameworkStores<DataContext>()
            .AddSignInManager<SignInManager<AppUser>>()
            .AddDefaultTokenProviders();  // to generate tokens for email confirmation

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["TokenKey"]));  // same as in TokenService.cs, saved in appsettings.Development.json for now
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(opt => 
                {
                    opt.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = key,
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ValidateLifetime = true,  // check expiry
                        ClockSkew = TimeSpan.Zero  // exact expiry, by deafult there's a 5 minute margin
                    };
                    opt.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {  // we expect the token as query param for SignalR ChatHub
                            var accessToken = context.Request.Query["access_token"];  
                            var path = context.HttpContext.Request.Path;
                            if (!string.IsNullOrEmpty(accessToken) && (path.StartsWithSegments("/chat")))
                            {  // attach token to context for /chat endpoint
                                context.Token = accessToken;
                            }
                            return Task.CompletedTask;
                        }
                    };
                });

            services.AddAuthorization(options => 
            {
                options.AddPolicy("IsActivityHost", policy =>  // name given to add policy in routes (endpoints)
                {
                    policy.Requirements.Add(new IsHostRequirement());
                });
            });
            services.AddTransient<IAuthorizationHandler, IsHostRequirementHandler>();

            services.AddScoped<TokenService>();  // make available method to create tokens

            return services;
        }
    }
}