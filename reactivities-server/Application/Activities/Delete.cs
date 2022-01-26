using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using AutoMapper;
using Domain;
using MediatR;
using Persistence;

namespace Application.Activities
{
    public class Delete
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var activity = await _context.Activities.FindAsync(request.Id);
                
                // if (activity == null) return null;
                
                _context.Remove(activity);  // just _context.Remove also works
                var success = 0 < await _context.SaveChangesAsync();
                if (success) return Result<Unit>.Sucess(Unit.Value);
                return Result<Unit>.Failure("Failed to delete activity");
            }
        }
  }
}