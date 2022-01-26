using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Activities;
using Application.Core;
using Application.Interfaces;
using Infrastructure.Email;
using Infrastructure.Photos;
using Infrastructure.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Persistence;

namespace API.Extensions
{
    public static class ApplicationServiceExtensions  // refactored services into a file
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config) {
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "WebAPIv5", Version = "v1" });
            });

            services.AddDbContext<DataContext>(options =>
            {
                var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

                string connectionString;

                // Depending on if in development or production, use either Heroku-provided
                // connection string, or development connection string from env var.
                if (env == "Development")
                {
                    // Use connection string from file.
                    connectionString = config.GetConnectionString("DefaultConnection");  // taken from appsettings project file
                }
                else
                {
                    // Use connection string provided at runtime by Heroku.
                    var connectionUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

                    // Parse connection URL to connection string for Npgsql
                    connectionUrl = connectionUrl.Replace("postgres://", string.Empty);
                    var pgUserPass = connectionUrl.Split("@")[0];
                    var pgHostPortDb = connectionUrl.Split("@")[1];
                    var pgHostPort = pgHostPortDb.Split("/")[0];
                    var pgDb = pgHostPortDb.Split("/")[1];
                    var pgUser = pgUserPass.Split(":")[0];
                    var pgPass = pgUserPass.Split(":")[1];
                    var pgHost = pgHostPort.Split(":")[0];
                    var pgPort = pgHostPort.Split(":")[1];

                    connectionString = $"Server={pgHost};Port={pgPort};User Id={pgUser};Password={pgPass};Database={pgDb}; SSL Mode=Require; Trust Server Certificate=true";
                }

                // Whether the connection string came from the local development configuration file
                // or from the environment variable from Heroku, use it to set up your DbContext.
                options.UseNpgsql(connectionString);
            });

            services.AddCors(opt =>  // configure CORS policy
            {
                opt.AddPolicy("CorsPolicy", policy => 
                {
                    policy
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .WithExposedHeaders("WWW-Authenticate", "Pagination")  // to check for expired token 401 in ui
                      .AllowCredentials()  // for SignalR
                      .WithOrigins("http://localhost:3000");
                });
            }); 

            services.AddMediatR(typeof(List.Handler).Assembly);  // handle list query

            services.AddAutoMapper(typeof(MappingProfiles).Assembly);  // to map objects when updating

            services.AddScoped<IUserAccessor, UserAccessor>();  // inject dependecy to required IUserAccessor

            services.AddScoped<IPhotoAccessor, PhotoAccessor>();  // inject image access dependency to use from Application 

            services.AddScoped<EmailSender>();  // inject our SendGrid email service

            services.Configure<CloudinarySettings>(config.GetSection("Cloudinary"));  // same name as in appsettings.json, I guess the json object is parsed to a class instance object

            services.AddSignalR();  // add SingalR services used in our ChatHub

            return services;
        }
    }
}