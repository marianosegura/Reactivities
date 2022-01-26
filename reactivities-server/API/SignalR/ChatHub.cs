using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Comments;
using MediatR;
using Microsoft.AspNetCore.SignalR;


namespace API.SignalR
{
    public class ChatHub : Hub  // derive from base Hub
    {
        private readonly IMediator _mediator;


        public ChatHub(IMediator mediator)
        {
            _mediator = mediator;
        }


        public async Task SendComment(Create.Command command)  // like api handlers, gets the command from the body
        {
            var commentResult = await _mediator.Send(command);  // create comment to the database 
            
            await Clients.Group(command.ActivityId.ToString())  // send to group based on activity guid
                .SendAsync("ReceiveComment", commentResult.Value);  // the string is the callable method in the client
        }


        public override async Task OnConnectedAsync()  // add user to activity group when connected
        {  
            var activityId = Context.GetHttpContext().Request.Query["activityId"];  // activity id comes in query params
            
            await Groups.AddToGroupAsync(Context.ConnectionId, activityId);  // add current connection to group 

            var commentsResult = await _mediator.Send(new List.Query{ActivityId = Guid.Parse(activityId)});
            await Clients.Caller.SendAsync("LoadComments", commentsResult.Value);  // send caller the activity comments

        }  // SignalR removes from group upon disconnection
    }
}