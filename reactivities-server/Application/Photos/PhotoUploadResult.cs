using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Photos
{
    public class PhotoUploadResult  
    {  // we need our own Cloudinary result class since Application project doesn't have access to the API classes, it depends on Infrastructure interfaces
        public string PublicId { get; set; }
        public string Url { get; set; }
    }
}