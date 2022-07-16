---
title: A Professional ASP.NET Core API - Paging
date: October 4 2020
category: aspnetcore-api
tags:
    - dotnet
    - aspnetcore
    - webapi
    - paging
    - pagination
    - fakedata
    - bogus
    - testdata
---

Paging refers to **getting partial results from an API**. Imagine having millions of results in the database and having your application try to return all of them at once.

Not only that would be an extremely ineffective way of returning the results, but it could also possibly have devastating effects on the application itself or the hardware it runs on. Moreover, every client has limited memory resources and it needs to restrict the number of shown results.

Thus, we need a way to return a set number of results to the client in order to avoid these consequences.

<!-- more -->

## Fake data generator

To work with a big list for paging we need a library to generate fake data. We use `Bogus` for this goal.

Install below package

```cs
Install-Package Bogus -Version 31.0.2
dotnet add package Bogus --version 31.0.2
<PackageReference Include="Bogus" Version="31.0.2" />
```

**Our Models**

We want to return list of people so I should write the following classes

```cs
// Person.cs
public class Person
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string FamilyName { get; set; }
    public float Age { get; set; }
    public DateTimeOffset BithDate { get; set; }
    public IEnumerable<Phone> Phones { get; set; }
    public IEnumerable<Address> Addresses { get; set; }
    public Person()
    {
        Phones = new List<Phone>();
        Addresses = new List<Address>();
    }
}

// Address.cs
public class Address
{
    public string Country { get; set; }
    public string City { get; set; }
    public string MainStreet { get; set; }
    public string Info { get; set; }
    public string No { get; set; }
}

// Phone.cs
public class Phone
{
    public string Code { get; set; }
    public string Number { get; set; }
}
```

**Generator**

To generate fake data we should do like below

```cs
// PeopleDataGenerator.cs
using Bogus;

public static class PeopleDataGenerator
{
    public static IEnumerable<Person> GetPeople(int count = 200)
    {
        var testPhone = new Faker<Phone>()
                .StrictMode(true)
                .RuleFor(p => p.Code, f => f.Address.CountryCode())
                .RuleFor(p => p.Number, f => f.Phone.PhoneNumber())
                ;
        var testAddress = new Faker<Address>()
                .StrictMode(true)
                .RuleFor(a => a.Country, f => f.Address.Country())
                .RuleFor(a => a.City, f => f.Address.City())
                .RuleFor(a => a.No, f => f.Address.BuildingNumber())
                .RuleFor(a => a.Info, f => f.Address.FullAddress())
                .RuleFor(a => a.MainStreet, f => f.Address.StreetAddress())
                ;
        var testPerson = new Faker<Person>()
                .StrictMode(true)
                .RuleFor(p => p.Id, f => Guid.NewGuid())
                .RuleFor(p => p.Name, f => f.Name.FirstName())
                .RuleFor(p => p.FamilyName, f => f.Name.LastName())
                .RuleFor(p => p.Age, f => f.Random.Float(1, 120))
                .RuleFor(p => p.BithDate, f => f.Person.DateOfBirth)
                .RuleFor(p => p.Phones, f => testPhone.Generate(15))
                .RuleFor(p => p.Addresses, f => testAddress.Generate(10))
                ;
        return testPerson.Generate(count);
    }
}
```

`GetPeople()` will generate 200 people in default mode.

**Goal**

Our goal is make pagination for `Get()` action method:

```cs
[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    [HttpGet]
    public IEnumerable<Person> Get()
    {
        // OUR GOAL
        var data = PeopleDataGenerator.GetPeople();
        return data;
    }
}
```

## New paging result

It’s always a good practice to add wrappers to your API response. What is a wrapper? Instead of just returning the data in the response, you have a possibility to return other parameters like error messages, response status, page number, data, page size, and so on.

So, write the following classes

```cs
// Response.cs
public class Response<T>
{
    public Response(T data)
    {
        Succeeded = true;
        Message = string.Empty;
        Errors = null;
        Data = data;
    }
    public T Data { get; set; }
    public bool Succeeded { get; set; }
    public string[] Errors { get; set; }
    public string Message { get; set; }
}

// PagedResponse.cs
using System;

public class PagedResponse<T> : Response<T>
{
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public Uri FirstPage { get; set; }
    public Uri LastPage { get; set; }
    public int TotalPages { get; set; }
    public int TotalRecords { get; set; }
    public Uri NextPage { get; set; }
    public Uri PreviousPage { get; set; }
    public PagedResponse(T data, int pageNumber, int pageSize) : base(data)
    {
        PageNumber = pageNumber;
        PageSize = pageSize;
        Data = data;
        Message = null;
        Succeeded = true;
        Errors = null;
    }
    public PagedResponse(T data, PaginationFilter paginationFilter) : this(data, paginationFilter.PageNumber, paginationFilter.PageSize)
    {
    }
}
```

To send our filtering config we need another class

```cs
public class PaginationFilter
{
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public PaginationFilter()
    {
        PageNumber = 1;
        PageSize = 10;
    }
    public PaginationFilter(int pageNumber, int pageSize)
    {
        PageNumber = pageNumber < 1 ? 1 : pageNumber;
        PageSize = pageSize < 1 ? 1 : pageSize;
    }
}
```

Now, we are able to do something like this:

```cs
// http://localhost:PORT/weatherforecast?pageNumber=2&pageSize=10

[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    [HttpGet]
    public IEnumerable<Person> Get([FromQuery] PaginationFilter filter)
    {
        var data = PeopleDataGenerator.GetPeople()
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize);
        return data;
    }
}
```

`[FromQuery]` is necessary because we will send our parameters via query strings.

## Generating Pagination URLs

One of the most challenging sections is building URIs. For this purpose we need to define a `PagedUriService` to generate the URI:

```cs
// IPagedUriService.cs
public interface IPagedUriService
{
    public Uri GetPageUri(PaginationFilter filter, string route);
}

// PagedUriService.cs
public class PagedUriService : IPagedUriService
{
    private readonly string _baseUri;
    public PagedUriService(string baseUri)
    {
        _baseUri = baseUri;
    }
    public Uri GetPageUri(PaginationFilter filter, string route)
    {
        var _enpointUri = new Uri(string.Concat(_baseUri, route));
        var modifiedUri = QueryHelpers.AddQueryString(_enpointUri.ToString(), "pageNumber", filter.PageNumber.ToString());
        modifiedUri = QueryHelpers.AddQueryString(modifiedUri, "pageSize", filter.PageSize.ToString());
        return new Uri(modifiedUri);
    }
}
```

We should register `PagedUriService` into the DI.

```cs
// PagingServiceExtension.cs
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

public static class PagingServiceExtension
{
    public static IServiceCollection AddPaging(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();
        services.AddSingleton<IPagedUriService>(o =>
        {
            var accessor = o.GetRequiredService<IHttpContextAccessor>();
            var request = accessor.HttpContext.Request;
            var uri = string.Concat(request.Scheme, "://", request.Host.ToUriComponent());
            return new PagedUriService(uri);
        });
        return services;
    }
}
```

Finally, we need some functionalities to convert our raw list to paged result:

```cs
// PagingExtensions.cs
public static class PagingExtensions
{
    public static PagedResponse<IEnumerable<T>> ToPagedReponse<T>(this IEnumerable<T> pagedData, PaginationFilter validFilter, int totalRecords, IPagedUriService uriService, string route)
    {
        var respose = new PagedResponse<IEnumerable<T>>(pagedData, validFilter.PageNumber, validFilter.PageSize);
        var totalPages = totalRecords / (double)validFilter.PageSize;
        int roundedTotalPages = Convert.ToInt32(Math.Ceiling(totalPages));
        if (string.IsNullOrEmpty(route) || uriService == null)
        {
            respose.FirstPage = null;
            respose.PreviousPage = null;
            respose.NextPage = null;
            respose.LastPage = null;
        }
        else
        {
            respose.NextPage =
                validFilter.PageNumber >= 1 && validFilter.PageNumber < roundedTotalPages
                ? uriService.GetPageUri(new PaginationFilter(validFilter.PageNumber + 1, validFilter.PageSize), route)
                : null;
            respose.PreviousPage =
                validFilter.PageNumber - 1 >= 1 && validFilter.PageNumber <= roundedTotalPages
                ? uriService.GetPageUri(new PaginationFilter(validFilter.PageNumber - 1, validFilter.PageSize), route)
                : null;
            respose.FirstPage = uriService.GetPageUri(new PaginationFilter(1, validFilter.PageSize), route);
            respose.LastPage = uriService.GetPageUri(new PaginationFilter(roundedTotalPages, validFilter.PageSize), route);
        }
        respose.TotalPages = roundedTotalPages;
        respose.TotalRecords = totalRecords;
        return respose;
    }
    public static PagedResponse<IEnumerable<T>> ToPagedReponse<T>(this IEnumerable<T> pagedData, int pageNumber, int pageSize, int totalRecords, IPagedUriService uriService, string route)
    {
        return pagedData.ToPagedReponse(new PaginationFilter(pageNumber, pageSize), totalRecords, uriService, route);
    }
    public static IActionResult ToPagedResult<T>(this IEnumerable<T> pagedData, int pageNumber, int pageSize, int totalRecords, IPagedUriService uriService, string route)
    {
        return new OkObjectResult(pagedData.ToPagedReponse(new PaginationFilter(pageNumber, pageSize), totalRecords, uriService, route));
    }
    public static IActionResult ToPagedResult<T>(this IEnumerable<T> pagedData, PaginationFilter validFilter, int totalRecords, IPagedUriService uriService, string route)
    {
        return new OkObjectResult(pagedData.ToPagedReponse(validFilter, totalRecords, uriService, route));
    }
    public static PagedResponse<IQueryable<T>> ToPagedReponse<T>(this IQueryable<T> pagedData, PaginationFilter validFilter, int totalRecords, IPagedUriService uriService, string route)
    {
        return pagedData.ToPagedReponse(validFilter, totalRecords, uriService, route);
    }
    public static PagedResponse<IQueryable<T>> ToPagedReponse<T>(this IQueryable<T> pagedData, int pageNumber, int pageSize, int totalRecords, IPagedUriService uriService, string route)
    {
        return pagedData.ToPagedReponse(new PaginationFilter(pageNumber, pageSize), totalRecords, uriService, route);
    }
    public static IActionResult ToPagedResult<T>(this IQueryable<T> pagedData, int pageNumber, int pageSize, int totalRecords, IPagedUriService uriService, string route)
    {
        return new OkObjectResult(pagedData.ToPagedReponse(new PaginationFilter(pageNumber, pageSize), totalRecords, uriService, route));
    }
    public static IActionResult ToPagedResult<T>(this IQueryable<T> pagedData, PaginationFilter validFilter, int totalRecords, IPagedUriService uriService, string route)
    {
        return new OkObjectResult(pagedData.ToPagedReponse(validFilter, totalRecords, uriService, route));
    }
    public static IActionResult ToOnePagedResult<T>(this IQueryable<T> pagedData, int totalRecords, IPagedUriService uriService, string route)
    {
        return pagedData.ToPagedResult(1, totalRecords, totalRecords, uriService, route);
    }
    public static IActionResult ToOnePagedResult<T>(this IEnumerable<T> pagedData, int totalRecords, IPagedUriService uriService, string route)
    {
        return pagedData.ToPagedResult(1, totalRecords, totalRecords, uriService, route);
    }
    public static PagedResponse<IEnumerable<T>> ToOnePagedReponse<T>(this IEnumerable<T> pagedData, int totalRecords, IPagedUriService uriService, string route)
    {
        return pagedData.ToPagedReponse(1, totalRecords, totalRecords, uriService, route);
    }
    public static PagedResponse<IQueryable<T>> ToOnePagedReponse<T>(this IQueryable<T> pagedData, int totalRecords, IPagedUriService uriService, string route)
    {
        return pagedData.ToPagedReponse(1, totalRecords, totalRecords, uriService, route);
    }
}
```

## How to use?

Using a new paging functionality is so easy, Just follow bellow steps:

First, Register `AddPaging` service.

```cs
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    // HERE
    services.AddPaging();
}
```

Second, Pass `IPagedUriService` to the constructor of controller.
Third, Use `Request.Path.Value` to get the route data.
Fourth, Use `ToPagedResult` to convert the list to a paged result as an `IActionResult`.

```cs
[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    private readonly IPagedUriService _uriService;
    public WeatherForecastController(IPagedUriService uriService /* HERE */)
    {
        _uriService = uriService;
    }
    [HttpGet]
    public IActionResult Get([FromQuery] PaginationFilter filter)
    {
        var route = Request.Path.Value;
        var data = PeopleDataGenerator.GetPeople();
        var count = data.Count();
        var pagedData = data.ToPagedResult(filter, count, _uriService, route);
        return pagedData;
    }
}
```

You result will be like below

```json
// https://localhost:5001/weatherforecast?pageNumber=2&pageSize=10
{
  "pageNumber": 2,
  "pageSize": 10,
  "firstPage": "https://localhost:5001/weatherforecast?pageNumber=1&pageSize=10",
  "lastPage": "https://localhost:5001/weatherforecast?pageNumber=20&pageSize=10",
  "totalPages": 20,
  "totalRecords": 200,
  "nextPage": "https://localhost:5001/weatherforecast?pageNumber=3&pageSize=10",
  "previousPage": "https://localhost:5001/weatherforecast?pageNumber=1&pageSize=10",
  "data": [    
    {
      "id": "20f216f8-1c28-40e3-8687-30414e0b1e43",
      "name": "Norris",
      "familyName": "Gaylord",
      "age": 93.91649,
      "bithDate": "1983-08-19T20:29:12.2566788+04:30",
      "phones": [
        {
          "code": "CG",
          "number": "1-990-301-7170"
        },
        {
          "code": "GF",
          "number": "435-648-1211 x2527"
        },
        {
          "code": "EE",
          "number": "452-350-1534 x565"
        },
        {
          "code": "HU",
          "number": "454-359-3006"
        },
        {
          "code": "UG",
          "number": "848.828.2965"
        },
        {
          "code": "AR",
          "number": "(481) 493-4770"
        },
        {
          "code": "WS",
          "number": "764.491.4668"
        },
        {
          "code": "FK",
          "number": "(927) 724-4714 x1111"
        },
        {
          "code": "AW",
          "number": "348.380.0028 x0504"
        },
        {
          "code": "KE",
          "number": "(222) 317-4262 x221"
        },
        {
          "code": "LA",
          "number": "(864) 234-4896"
        },
        {
          "code": "CY",
          "number": "1-596-579-7108 x764"
        },
        {
          "code": "RU",
          "number": "378.786.5243"
        },
        {
          "code": "ZM",
          "number": "(233) 668-1087"
        },
        {
          "code": "LK",
          "number": "442.582.0962 x311"
        }
      ],
      "addresses": [
        {
          "country": "San Marino",
          "city": "Lake Shaniya",
          "mainStreet": "4821 Federico Burg",
          "info": "2724 Brakus Spurs, East Kenyattaport, French Guiana",
          "no": "43796"
        },
        {
          "country": "Cuba",
          "city": "Lubowitzborough",
          "mainStreet": "396 Murazik Roads",
          "info": "268 Heathcote Extension, Toytown, Uruguay",
          "no": "72283"
        },
        {
          "country": "Lao People's Democratic Republic",
          "city": "Dickinsonview",
          "mainStreet": "7750 Dimitri Rapids",
          "info": "360 David Run, Boyleborough, Marshall Islands",
          "no": "22955"
        },
        {
          "country": "Vietnam",
          "city": "East Rosemary",
          "mainStreet": "055 Paolo Glen",
          "info": "71691 Hammes Locks, Port Mackenzieborough, Swaziland",
          "no": "710"
        },
        {
          "country": "China",
          "city": "South Casandrafurt",
          "mainStreet": "894 Stiedemann Via",
          "info": "60676 Fay Isle, Juvenalbury, Namibia",
          "no": "38640"
        },
        {
          "country": "Lebanon",
          "city": "Dorcasshire",
          "mainStreet": "49750 Flatley Groves",
          "info": "7761 Howell Springs, West Quintonside, Mexico",
          "no": "4452"
        },
        {
          "country": "Libyan Arab Jamahiriya",
          "city": "Amiyashire",
          "mainStreet": "112 Baumbach Field",
          "info": "61227 Nils Flat, Lafayettefurt, Mexico",
          "no": "0611"
        },
        {
          "country": "Rwanda",
          "city": "McCulloughhaven",
          "mainStreet": "503 Anthony Extensions",
          "info": "336 Kling Mission, East Parisshire, Uganda",
          "no": "67206"
        },
        {
          "country": "Zimbabwe",
          "city": "North Garrisonton",
          "mainStreet": "56022 Cecile Place",
          "info": "52476 Wyman Branch, Sporerview, Sao Tome and Principe",
          "no": "34449"
        },
        {
          "country": "Nigeria",
          "city": "North Isadore",
          "mainStreet": "2893 Alvera Greens",
          "info": "590 Rupert Avenue, Lake Alexys, China",
          "no": "91788"
        }
      ]
    },
    {
      "id": "da39bc7a-cdfa-49a6-8eda-2d8578a10a95",
      "name": "Loyal",
      "familyName": "Simonis",
      "age": 13.926475,
      "bithDate": "1999-04-08T18:35:10.3663495+04:30",
      "phones": [
        {
          "code": "CL",
          "number": "611-390-0679"
        },
        {
          "code": "JM",
          "number": "333-284-4157 x15776"
        },
        {
          "code": "BH",
          "number": "(775) 257-6981 x8944"
        },
        {
          "code": "SA",
          "number": "(925) 759-5904 x70541"
        },
        {
          "code": "IN",
          "number": "1-287-226-3739 x26113"
        },
        {
          "code": "IN",
          "number": "1-835-217-5850 x0543"
        },
        {
          "code": "ZM",
          "number": "239-517-9971 x933"
        },
        {
          "code": "UG",
          "number": "587.700.3823"
        },
        {
          "code": "TM",
          "number": "1-729-462-2169 x5501"
        },
        {
          "code": "HN",
          "number": "925.856.6956 x9365"
        },
        {
          "code": "BO",
          "number": "436.252.3008 x641"
        },
        {
          "code": "GB",
          "number": "(969) 740-3197 x2393"
        },
        {
          "code": "SV",
          "number": "(392) 998-7274 x247"
        },
        {
          "code": "AI",
          "number": "899.370.6658"
        },
        {
          "code": "UM",
          "number": "1-983-472-3551"
        }
      ],
      "addresses": [
        {
          "country": "Anguilla",
          "city": "Bradleyside",
          "mainStreet": "81514 Nicklaus View",
          "info": "031 Kohler Dam, South Dave, Heard Island and McDonald Islands",
          "no": "2989"
        },
        {
          "country": "Lesotho",
          "city": "Lindaberg",
          "mainStreet": "143 O'Connell Points",
          "info": "862 Hoeger Lodge, North Sid, Algeria",
          "no": "87646"
        },
        {
          "country": "Singapore",
          "city": "Lake Stephon",
          "mainStreet": "85625 Kub Isle",
          "info": "6441 Bruen Parkways, North Crystal, Togo",
          "no": "8897"
        },
        {
          "country": "Cayman Islands",
          "city": "Lake Ethelland",
          "mainStreet": "40312 Herzog Walks",
          "info": "8711 Roberts Center, South Sophiaborough, Bosnia and Herzegovina",
          "no": "969"
        },
        {
          "country": "Singapore",
          "city": "Alfordchester",
          "mainStreet": "391 Corkery Junction",
          "info": "4566 Erwin Greens, West Marshall, Pakistan",
          "no": "3716"
        },
        {
          "country": "United States of America",
          "city": "West Kadin",
          "mainStreet": "1807 Reinger Place",
          "info": "265 Evalyn Flats, Klinghaven, Honduras",
          "no": "389"
        },
        {
          "country": "Cote d'Ivoire",
          "city": "Kesslerberg",
          "mainStreet": "6985 Lenore Isle",
          "info": "50346 Parisian Viaduct, West Efrain, Ukraine",
          "no": "1107"
        },
        {
          "country": "Serbia",
          "city": "South Velvashire",
          "mainStreet": "573 Pfeffer Courts",
          "info": "472 Brekke Knolls, Darronchester, Hong Kong",
          "no": "70450"
        },
        {
          "country": "Taiwan",
          "city": "Kaleside",
          "mainStreet": "94647 Murphy Vista",
          "info": "8682 Stoltenberg Flats, Port Tianafurt, Bouvet Island (Bouvetoya)",
          "no": "3502"
        },
        {
          "country": "Cayman Islands",
          "city": "South Demetrischester",
          "mainStreet": "50811 Orn Shore",
          "info": "1378 Lehner Rest, Lake Irma, Cook Islands",
          "no": "0960"
        }
      ]
    },
	...
  ],
  "succeeded": true,
  "errors": null,
  "message": null
}
```

## Reference(s)

Most of the information in this article has gathered from various references.

* https://www.codewithmukesh.com/blog/pagination-in-aspnet-core-webapi/
* https://code-maze.com/paging-aspnet-core-webapi/
* https://medium.com/@zarkopafilis/asp-net-core-2-2-3-rest-api-26-pagination-650d0363ccf6
* https://www.carlrippon.com/scalable-and-performant-asp-net-core-web-apis-paging/
* https://schneids.net/paging-in-asp-net-web-api