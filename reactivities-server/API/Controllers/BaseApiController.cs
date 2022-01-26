using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Extensions;
using Application.Core;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BaseApiController : ControllerBase  // to save repeating the 2 above attributes
    {
        private IMediator _mediator;


        protected IMediator Mediator =>  // expression-bodied member, returns _mediator if not null
            _mediator  // if null then requests the service, sets _mediator and returns it
            ??= HttpContext.RequestServices.GetService<IMediator>();  // ??= sets the right expression to the left var is the var is null


        protected ActionResult HandleResult<T>(Result<T> result)  // refactored to use for any route
        {
            if (result == null || result.IsSuccess && result.Value == null) return NotFound();
            if (result.IsSuccess && result.Value != null) return Ok(result.Value);
            return BadRequest(result.Error);
        }


        protected ActionResult HandlePagedResult<T>(Result<PagedList<T>> result)  // for paginated responses, attached pagination header
        {
            if (result == null || result.IsSuccess && result.Value == null) return NotFound();
            if (result.IsSuccess && result.Value != null)
            {
                var list =  result.Value;  // paginated list, to get values
                Response.AddPaginationHeader(list.CurrentPage, list.PageSize, list.TotalCount, list.TotalPages);
                return Ok(result.Value);
            }
            return BadRequest(result.Error);
        }
    }
}