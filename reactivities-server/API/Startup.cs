using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Extensions;
using API.Middleware;
using API.SignalR;
using Application.Activities;
using Application.Core;
using FluentValidation.AspNetCore;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using Persistence;

namespace API
{
    public class Startup
    {
        private readonly IConfiguration _config;

        public Startup(IConfiguration config)
        {
            _config = config;
        }


        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)  // injecting dependencies to ask for them in controllers
        {
            services.AddControllers(opt => 
                {  // make all API endpoints required auth by default
                    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
                    opt.Filters.Add(new AuthorizeFilter(policy));
                })
                .AddFluentValidation(config => 
                {  // configure fluent validation
                    config.RegisterValidatorsFromAssemblyContaining<Create>();
                });  
            services.AddApplicationServices(_config);  // refactored services
            services.AddIdentityServices(_config);  // user auth related configuration 
        }


        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseMiddleware<ExceptionMiddleware>();  // our own custom middleware that handles exceptions
            
            app.UseXContentTypeOptions();  // including security headers
            app.UseReferrerPolicy(opt => opt.NoReferrer());
            app.UseXXssProtection(opt => opt.EnabledWithBlockMode());  // cross site scripting protection
            app.UseXfo(opt => opt.Deny());  // clickjacking protection
            app.UseCsp(opt => opt
                .BlockAllMixedContent()  // don't mix http and https
                .StyleSources(s => s.Self().CustomSources("https://fonts.googleapis.com"))  // we're ok with anything (resources, js scripts) in our domain
                .FontSources(s => s.Self().CustomSources("https://fonts.gstatic.com", "data:"))  
                .FormActions(s => s.Self())  
                .FrameAncestors(s => s.Self())  // image rule doesn't work, it rejects the drag n' drop functionality
                // .ImageSources(s => s.Self().CustomSources("https://res.cloudinary.com"))  
                .ScriptSources(s => s.Self().CustomSources("sha256-ejMLVdewr8WRn7xJlQ2r5HhV3A/G84+jLYhKyV/5Zj0="))  
            );

            if (env.IsDevelopment())
            {
                // app.UseDeveloperExceptionPage();  // removed to our own exception handling
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "WebAPIv5 v1"));
            } 
            else
            {  // production only security, strict-transport-security header
                app.Use(async (context, next) => 
                {
                    context.Response.Headers.Add("Strict-Transport-Security", "max-age=31536000");
                    await next.Invoke();
                });
            }

            // app.UseHttpsRedirection();  // commented because we are not using https for dev

            app.UseRouting();

            // server side serving has to go here, order is important
            app.UseDefaultFiles();  // searches for wwwroot/index.html
            app.UseStaticFiles();  // serves index.html

            app.UseCors("CorsPolicy");

            app.UseAuthentication();  // must be before Authorization

            app.UseAuthorization();  // not doing anything right now

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<ChatHub>("/chat");  // endpoint to connect to the chat hub 
                endpoints.MapFallbackToController("Index", "Fallback");  // redirect fallbacks to controller (to finally redirect to react app)
            });                                   // Index is the method name, Fallback the controller name
        }
    }
}
