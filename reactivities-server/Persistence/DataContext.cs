using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Persistence
{
  public class DataContext : IdentityDbContext<AppUser>  // automatically creates user related tables
  {   
    public DbSet<Activity> Activities { get; set; }  // our Activity table, takes the name from the property (so it will be called activities)
    public DbSet<ActivityAttendee> ActivitiesAttendees { get; set; }  // to query relationship table
    public DbSet<Photo> Photos { get; set; }  // to query all db photos
    public DbSet<Comment> Comments { get; set; }  // to query comments
    public DbSet<UserFollowing> UserFollowings { get; set; } 

    
    public DataContext(DbContextOptions options) : base(options)  // passing options to parent constructor
    {
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);  // for utf DateTime UTF date conflict 
        AppContext.SetSwitch("Npgsql.DisableDateTimeInfinityConversions", true);
    }


    protected override void OnModelCreating(ModelBuilder builder)  // configure manually ActivityAttendee table
    {
        base.OnModelCreating(builder);
        builder.Entity<ActivityAttendee>(activityXUserTable => 
            activityXUserTable.HasKey(activityXUser => 
            new { activityXUser.AppUserId, activityXUser.ActivityId }  // PRIMARY KEY (AppUserId, ActivityId), making composite primary key
            )
        );  
        
        // configuring many to many relationship
        builder.Entity<ActivityAttendee>()  // 1 AppUser (fk AppUserId) -> n Activities
            .HasOne(x => x.AppUser)           
            .WithMany(x => x.Activities)
            .HasForeignKey(x => x.AppUserId);
        
        builder.Entity<ActivityAttendee>()  // 1 Activity (fk ActivityId) -> n AppUser
            .HasOne(x => x.Activity)
            .WithMany(x => x.Attendees)
            .HasForeignKey(x => x.ActivityId);
    
        builder.Entity<Comment>()  // 1 activity -> n comments
            .HasOne(comment => comment.Activity)
            .WithMany(activity => activity.Comments)
            .OnDelete(DeleteBehavior.Cascade);  // delete comments on cascade
        
        builder.Entity<UserFollowing>(b =>  // many to many relationship
        {
            b.HasKey(k => new {k.ObserverId, k.TargetId});

            b.HasOne(o => o.Observer)
                .WithMany(f => f.Followings)
                .HasForeignKey(o => o.ObserverId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(o => o.Target)
                .WithMany(f => f.Followers)
                .HasForeignKey(o => o.TargetId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
  }
}