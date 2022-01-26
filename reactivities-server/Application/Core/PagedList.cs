using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Application.Core
{
    public class PagedList<T> : List<T>
    {
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }


        public PagedList(IEnumerable<T> items, int count, int pageNumber, int pageSize)
        {
            CurrentPage = pageNumber;
            TotalPages = (int) Math.Ceiling(count / (double) pageSize);
            PageSize = pageSize;
            TotalCount = count;
            AddRange(items);  // add items to list
        }


        public static async Task<PagedList<T>> CreateAsync(IQueryable<T> source, int pageNumber, int pageSize)
        {  // given a query, apply pagination and return paginated list
            var count = await source.CountAsync();  // total items
            var items = await source.Skip((pageNumber - 1) * pageSize)  // pageNumber is 1-indexed
                .Take(pageSize)  // take just the amount per page max
                .ToListAsync();
            return new PagedList<T>(items, count, pageNumber, pageSize);
        }
    }
}