---
title: A Professional ASP.NET Core API - External APIs
date: September 3 2020
category: aspnetcore-api
tags:
    - dotnet
    - aspnetcore
    - webapi
    - api
    - polly
    - refit
    - resiliency
---

In many projects we want to call external APIs and use their results in our application. In this article, we will address the following:

* HttpClientFactory
* Refit
* Polly

<!-- more -->

## HttpClientFactory

Microsoft introduced the `HttpClient` in .Net Framework 4.5 and is the most popular way to consume a Web API in your .NET server-side code. But it has some serious issues like disposing the HttpClient object doesn’t close the socket immediately, too many instances affecting the performance and Singleton HttpClient or shared HttpClient instance not respecting the DNS Time to Live (TTL) settings. `HttpClientFactory` solves the all these problems. It is one of the newest feature of ASP.NET Core 2.1. It provides a central location for naming and configuring and consuming logical HttpClients in your application, and this post talks about 3 ways to use HTTPClientFactory in ASP.NET Core 2.1.

There are 3 different ways to use it and we’ll see an example of each of them.

* Using HttpClientFactory Directly
* Named Clients
* Typed Clients

**Using HttpClientFactory Directly**

 you’ll always have to register the HttpClient in `ConfigureServices` method of the `Startup.cs` class. The following line of code registers HttpClient with no special configuration.
 
 ```cs
// Startup.ConfigureServices

public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();

	// HERE
    services.AddHttpClient();
}
 ```
 
You can use it in the following way in the API controller.

```cs
public class ValuesController : Controller
{
    private readonly IHttpClientFactory _httpClientFactory;
  
    public ValuesController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }
  
    [HttpGet]
    public async Task<ActionResult> Get()
    {
        var client = _httpClientFactory.CreateClient();
        client.BaseAddress = new Uri("http://api.github.com");
        string result = await client.GetStringAsync("/");
        return Ok(result);
    }
}
```
 
**Named Clients**

The basic use of HTTPClientFactory in above example is ideal in a situation where you need to make a quick request from a single place in the code. When you need to make multiple requests from multiple places from your code, "Named Clients" will help you. With named clients, you can define the HTTP client with some pre-configured settings which will be applied when creating the HttpClient. Like,

 ```cs
// Startup.ConfigureServices

public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();

	// HERE
    services.AddHttpClient();
    services.AddHttpClient("github", c =>
    {
        c.BaseAddress = new Uri("https://api.github.com/");
        c.DefaultRequestHeaders.Add("Accept", "application/vnd.github.v3+json");
        c.DefaultRequestHeaders.Add("User-Agent", "HttpClientFactory-Sample");
    });
}
 ```
 
 Here we call `AddHttpClient` twice, once with the name "github" and once without. The github client has some default configuration applied, namely the base address and two headers required to work with the GitHub API. The overload of `AddHttpClient` method accepts two parameters, a name and an Action delegate taking a HttpClient which allows us to configure the HttpClient.

You can use named client in the following way in the API controller.

```cs
public class ValuesController : Controller
{
    private readonly IHttpClientFactory _httpClientFactory;
  
    public ValuesController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }
  
    [HttpGet]
    public async Task<ActionResult> Get()
    {
        var client = _httpClientFactory.CreateClient("github");
        string result = await client.GetStringAsync("/");
        return Ok(result);
    }
}
```

Here, we are passing the registered name of the client in `CreateClient()` method to create HttpClient. This is useful as the default configuration defined at the time of registration will be pre-applied when we ask for a named client.

**Typed Client**
 
 Using Typed clients, you can define pre-configuration for your HttpClient inside a custom class. This custom class can be registered as Typed client, and later when needed, it can be injected via the calling class constructor. I prefer Typed Client for the following reasons,

* Flexible approach compare to named clients.
* You no longer have to deal with strings (like in named clients).
* You can encapsulate the HTTP calls and all logic dealing with that endpoint.

Let’s see an example. Below is a custom class defined for Github client.
 
```cs
public class GitHubClient
{
    public HttpClient Client { get; private set; }
    
    public GitHubClient(HttpClient httpClient)
    {
        httpClient.BaseAddress = new Uri("https://api.github.com/");
        httpClient.DefaultRequestHeaders.Add("Accept", "application/vnd.github.v3+json");
        httpClient.DefaultRequestHeaders.Add("User-Agent", "HttpClientFactory-Sample");
        Client = httpClient;
    }
}
```

You can register this as a typed client using the following line.

```cs
services.AddHttpClient<GitHubClient>();
```

And, use it in the following way in the API controller.

```cs
public class ValuesController : Controller
{
    private readonly GitHubClient _gitHubClient;;
  
    public ValuesController(GitHubClient gitHubClient)
    {
        _gitHubClient = gitHubClient;
    }
  
    [HttpGet]
    public async Task<ActionResult> Get()
    {
        string result = await _gitHubClient.client.GetStringAsync("/");
        return Ok(result);
    }
}
```

This works great. There is another better way of making typed client work. Here, the HttpClient is exposed directly, but you can encapsulate the HttpClient entirely using the following way. First, define a contract for the `GitHubClient`.

```cs
public interface IGitHubClient
{
    Task<string> GetData();
}
 
public class GitHubClient : IGitHubClient
{
    private readonly HttpClient _client;
 
    public GitHubClient(HttpClient httpClient)
    {
        httpClient.BaseAddress = new Uri("https://api.github.com/");
        httpClient.DefaultRequestHeaders.Add("Accept", "application/vnd.github.v3+json");
        httpClient.DefaultRequestHeaders.Add("User-Agent", "HttpClientFactory-Sample");
        _client = httpClient;
    }
 
    public async Task<string> GetData()
    {
        return await _client.GetStringAsync("/");
    }
}
```

Register this as a typed client using the following line.

```cs
services.AddHttpClient<IGitHubClient, GitHubClient>();
```

And, use it in the following way in the API controller.

```cs
public class ValuesController : Controller
{
    private readonly IGitHubClient _gitHubClient;;
     
    public ValuesController(IGitHubClient gitHubClient)
    {
        _gitHubClient = gitHubClient;
    }
     
    [HttpGet]
    public async Task<ActionResult> Get()
    {
        string result = await _gitHubClient.GetData();
        return Ok(result);
    }
}
```

This approach also makes unit testing easy while testing HttpClients as you no longer have to mock them.

## Refit

Refit is a library heavily inspired by `Square's Retrofit` library, and it turns your REST API into a live interface:

Install below packages

```bash
Install-Package refit -Version 5.2.1
dotnet add package refit --version 5.2.1
<PackageReference Include="refit" Version="5.2.1" />

Install-Package Refit.HttpClientFactory -Version 5.2.1
dotnet add package Refit.HttpClientFactory --version 5.2.1
<PackageReference Include="Refit.HttpClientFactory" Version="5.2.1" />

Install-Package Newtonsoft.Json -Version 12.0.3
dotnet add package Newtonsoft.Json --version 12.0.3
<PackageReference Include="Newtonsoft.Json" Version="12.0.3" />
```

Suppose in our project we want to call the following address to get comprehensive information about the `country` we want.

The documentation and how to call it is as follows:

**Doc**: https://restcountries.eu/

**API**: https://restcountries.eu/rest/v2/name/usa

Based on the documentation and results provided as an example, we want to have a strongly typed output so I used [json2csharp](https://json2csharp.com) to convert `JSON` to `C#` but I made some changes to the result like the following:

* Replace all `int` with `double`
* Removed `Root` class
* Changed `MyArray` to `Country`

`JsonProperty` uses for `Newtonsoft.Json` library but if you want to use the new `System.Text.Json` library, you should change it to `JsonPropertyName`.

**C# Class**

```cs
public class Currency
{
    [JsonProperty("code")]
    public string Code { get; set; }

    [JsonProperty("name")]
    public string Name { get; set; }

    [JsonProperty("symbol")]
    public string Symbol { get; set; }
}

public class Language
{
    [JsonProperty("iso639_1")]
    public string Iso6391 { get; set; }

    [JsonProperty("iso639_2")]
    public string Iso6392 { get; set; }

    [JsonProperty("name")]
    public string Name { get; set; }

    [JsonProperty("nativeName")]
    public string NativeName { get; set; }
}

public class Translations
{
    [JsonProperty("de")]
    public string De { get; set; }

    [JsonProperty("es")]
    public string Es { get; set; }

    [JsonProperty("fr")]
    public string Fr { get; set; }

    [JsonProperty("ja")]
    public string Ja { get; set; }

    [JsonProperty("it")]
    public string It { get; set; }

    [JsonProperty("br")]
    public string Br { get; set; }

    [JsonProperty("pt")]
    public string Pt { get; set; }

    [JsonProperty("nl")]
    public string Nl { get; set; }

    [JsonProperty("hr")]
    public string Hr { get; set; }

    [JsonProperty("fa")]
    public string Fa { get; set; }
}

public class Country
{
    [JsonProperty("name")]
    public string Name { get; set; }

    [JsonProperty("topLevelDomain")]
    public List<string> TopLevelDomain { get; set; }

    [JsonProperty("alpha2Code")]
    public string Alpha2Code { get; set; }

    [JsonProperty("alpha3Code")]
    public string Alpha3Code { get; set; }

    [JsonProperty("callingCodes")]
    public List<string> CallingCodes { get; set; }

    [JsonProperty("capital")]
    public string Capital { get; set; }

    [JsonProperty("altSpellings")]
    public List<string> AltSpellings { get; set; }

    [JsonProperty("region")]
    public string Region { get; set; }

    [JsonProperty("subregion")]
    public string Subregion { get; set; }

    [JsonProperty("population")]
    public double Population { get; set; }

    [JsonProperty("latlng")]
    public List<double> Latlng { get; set; }

    [JsonProperty("demonym")]
    public string Demonym { get; set; }

    [JsonProperty("area")]
    public double Area { get; set; }

    [JsonProperty("gini")]
    public object Gini { get; set; }

    [JsonProperty("timezones")]
    public List<string> Timezones { get; set; }

    [JsonProperty("borders")]
    public List<object> Borders { get; set; }

    [JsonProperty("nativeName")]
    public string NativeName { get; set; }

    [JsonProperty("numericCode")]
    public string NumericCode { get; set; }

    [JsonProperty("currencies")]
    public List<Currency> Currencies { get; set; }

    [JsonProperty("languages")]
    public List<Language> Languages { get; set; }

    [JsonProperty("translations")]
    public Translations Translations { get; set; }

    [JsonProperty("flag")]
    public string Flag { get; set; }

    [JsonProperty("regionalBlocs")]
    public List<object> RegionalBlocs { get; set; }

    [JsonProperty("cioc")]
    public string Cioc { get; set; }
}
```

Now, We want to use `Refit` to fetch data so write the following interface.

```cs
public interface ICountryApi
{
    // You have to start the URL with '/'
    [Get("/{version}/name/{country}")]
    Task<List<Country>> GetCountry(string version,string country);
}
```

And write your base address in `appsettings.json`

```json
// appsettings.json
// Don't use '/' at the end of the URL.
"MyRefitOptions": {
  "BaseAddress": "https://restcountries.eu/rest"
}
```

Register `Refit` client like below

```cs
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    
    services.AddRefitClient<ICountryApi>(settings)
            .ConfigureHttpClient(c => c.BaseAddress = new Uri(Configuration["MyRefitOptions:BaseAddress"]))                         
            ;
}
```

Use it inside a controller as following

```cs
[ApiController]
[Route("[controller]")]
public class CountryController : ControllerBase
{
    private readonly ICountryApi _countryApi;

    public CountryController(ICountryApi countryApi)
    {
        _countryApi = countryApi;
    }

    [HttpGet]
    public IEnumerable<Country> Get()
    {
        var countries = _countryApi.GetCountry("v2", "usa").GetAwaiter().GetResult();
        return countries;
    }
}
```

## Using Refit with the System.Text.Json

Using `Refit` with the new System.Text.Json APIs in .NET Core 3.0 to boost performance:

```cs
using System.Text.Json;

var options = new JsonSerializerOptions()
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,                
    WriteIndented = true,
};

var settings = new RefitSettings()
{
    ContentSerializer = new SystemTextJsonContentSerializer(options)
};

services.AddRefitClient<ICountryApi>(settings /*HERE*/)
        .ConfigureHttpClient(c => c.BaseAddress = new Uri(Configuration["MyRefitOptions:BaseAddress"]))                         
        ;
```

## Polly

```bash
Install-Package Polly -Version 7.2.1
dotnet add package Polly --version 7.2.1
<PackageReference Include="Polly" Version="7.2.1" />
```

`Polly` is a .NET resilience and transient-fault-handling library that allows developers to express policies such as `Retry`, `Circuit Breaker`, `Timeout`, `Bulkhead Isolation`, and `Fallback` in a fluent and thread-safe manner.

There are many topics in which you can use `Polly` and for this you should refer to its [site](https://github.com/App-vNext/Polly). But one of the most important reasons for using `Polly` is the `retry` process.

**Retry**

```cs
// Retry once
Policy
  .Handle<SomeExceptionType>()
  .Retry()

// Retry multiple times
Policy
  .Handle<SomeExceptionType>()
  .Retry(3)

// Retry multiple times, calling an action on each retry 
// with the current exception and retry count
Policy
    .Handle<SomeExceptionType>()
    .Retry(3, onRetry: (exception, retryCount) =>
    {
        // Add logic to be executed before each retry, such as logging
    });

// Retry multiple times, calling an action on each retry 
// with the current exception, retry count and context 
// provided to Execute()
Policy
    .Handle<SomeExceptionType>()
    .Retry(3, onRetry: (exception, retryCount, context) =>
    {
        // Add logic to be executed before each retry, such as logging 
    });
```

**Retry forever (until succeeds)**

```cs
// Retry forever
Policy
  .Handle<SomeExceptionType>()
  .RetryForever()

// Retry forever, calling an action on each retry with the 
// current exception
Policy
  .Handle<SomeExceptionType>()
  .RetryForever(onRetry: exception =>
  {
        // Add logic to be executed before each retry, such as logging       
  });

// Retry forever, calling an action on each retry with the
// current exception and context provided to Execute()
Policy
  .Handle<SomeExceptionType>()
  .RetryForever(onRetry: (exception, context) =>
  {
        // Add logic to be executed before each retry, such as logging       
  });
```

**Wait and retry**

```cs
// Retry, waiting a specified duration between each retry. 
// (The wait is imposed on catching the failure, before making the next try.)
Policy
  .Handle<SomeExceptionType>()
  .WaitAndRetry(new[]
  {
    TimeSpan.FromSeconds(1),
    TimeSpan.FromSeconds(2),
    TimeSpan.FromSeconds(3)
  });

// Retry, waiting a specified duration between each retry, 
// calling an action on each retry with the current exception
// and duration
Policy
  .Handle<SomeExceptionType>()
  .WaitAndRetry(new[]
  {
    TimeSpan.FromSeconds(1),
    TimeSpan.FromSeconds(2),
    TimeSpan.FromSeconds(3)
  }, (exception, timeSpan) => {
    // Add logic to be executed before each retry, such as logging    
  }); 

// Retry, waiting a specified duration between each retry, 
// calling an action on each retry with the current exception, 
// duration and context provided to Execute()
Policy
  .Handle<SomeExceptionType>()
  .WaitAndRetry(new[]
  {
    TimeSpan.FromSeconds(1),
    TimeSpan.FromSeconds(2),
    TimeSpan.FromSeconds(3)
  }, (exception, timeSpan, context) => {
    // Add logic to be executed before each retry, such as logging    
  });

// Retry, waiting a specified duration between each retry, 
// calling an action on each retry with the current exception, 
// duration, retry count, and context provided to Execute()
Policy
  .Handle<SomeExceptionType>()
  .WaitAndRetry(new[]
  {
    TimeSpan.FromSeconds(1),
    TimeSpan.FromSeconds(2),
    TimeSpan.FromSeconds(3)
  }, (exception, timeSpan, retryCount, context) => {
    // Add logic to be executed before each retry, such as logging    
  });

// Retry a specified number of times, using a function to 
// calculate the duration to wait between retries based on 
// the current retry attempt (allows for exponential backoff)
// In this case will wait for
//  2 ^ 1 = 2 seconds then
//  2 ^ 2 = 4 seconds then
//  2 ^ 3 = 8 seconds then
//  2 ^ 4 = 16 seconds then
//  2 ^ 5 = 32 seconds
Policy
  .Handle<SomeExceptionType>()
  .WaitAndRetry(5, retryAttempt => 
	TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)) 
  );

// Retry a specified number of times, using a function to 
// calculate the duration to wait between retries based on 
// the current retry attempt, calling an action on each retry 
// with the current exception, duration and context provided 
// to Execute()
Policy
  .Handle<SomeExceptionType>()
  .WaitAndRetry(
    5, 
    retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)), 
    (exception, timeSpan, context) => {
      // Add logic to be executed before each retry, such as logging
    }
  );

// Retry a specified number of times, using a function to 
// calculate the duration to wait between retries based on 
// the current retry attempt, calling an action on each retry 
// with the current exception, duration, retry count, and context 
// provided to Execute()
Policy
  .Handle<SomeExceptionType>()
  .WaitAndRetry(
    5, 
    retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)), 
    (exception, timeSpan, retryCount, context) => {
      // Add logic to be executed before each retry, such as logging
    }
  );
```

**Wait and retry forever (until succeeds)**

```cs
// Wait and retry forever
Policy
  .Handle<SomeExceptionType>()
  .WaitAndRetryForever(retryAttempt => 
	TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))
    );

// Wait and retry forever, calling an action on each retry with the 
// current exception and the time to wait
Policy
  .Handle<SomeExceptionType>()
  .WaitAndRetryForever(
    retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),    
    (exception, timespan) =>
    {
        // Add logic to be executed before each retry, such as logging       
    });

// Wait and retry forever, calling an action on each retry with the
// current exception, time to wait, and context provided to Execute()
Policy
  .Handle<SomeExceptionType>()
  .WaitAndRetryForever(
    retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),    
    (exception, timespan, context) =>
    {
        // Add logic to be executed before each retry, such as logging       
    });
```

Therefore, according to the above examples, we can implement our scenario as follows to see if the requested country is valid or not.

```cs
using Polly;
using System.Net;
using System.Net.Http;

[ApiController]
[Route("[controller]")]
public class CountryController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;

    public CountryController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    // http://localhost:5000/Country?country=usa
    // Result: true
    [HttpGet]
    public async Task<bool> IsValid(string country)
    {
        var retryPolicy = Policy
            .Handle<HttpRequestException>()
            .WaitAndRetryAsync(5, _ => TimeSpan.FromSeconds(2));

        var result = await retryPolicy.ExecuteAsync(async () =>
        {
            var status = await _httpClientFactory.CreateClient().GetAsync($"https://restcountries.eu/rest/v2/name/{country}").ConfigureAwait(false);
            return status.StatusCode == HttpStatusCode.OK;
        });

        return result;
    }
}
```

## Polly & HttpClientFactory

The following steps show how you can use Http retries with `Polly` integrated into `IHttpClientFactory`, which is explained in the previous section.

Install the below package

```bash
Install-Package Microsoft.Extensions.Http.Polly -Version 3.1.8
dotnet add package Microsoft.Extensions.Http.Polly --version 3.1.8
<PackageReference Include="Microsoft.Extensions.Http.Polly" Version="3.1.8" />
```

Register your `Polly` policy to `HttpClient` client

```cs
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers(); 

    // HERE           
    AsyncRetryPolicy<HttpResponseMessage> retryPolicy = HttpPolicyExtensions
        .HandleTransientHttpError()
        .OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.NotFound)
        .WaitAndRetryAsync(6, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));

    services.AddHttpClient<IBasketService, BasketService>()
        .SetHandlerLifetime(TimeSpan.FromMinutes(5))  //Set lifetime to five minutes
        .AddPolicyHandler(retryPolicy); // HERE
}
```

## Polly & Refit

Install the below package

```bash
Install-Package Microsoft.Extensions.Http.Polly -Version 3.1.8
dotnet add package Microsoft.Extensions.Http.Polly --version 3.1.8
<PackageReference Include="Microsoft.Extensions.Http.Polly" Version="3.1.8" />
```

Register your `Polly` policy to `Refit` client

```cs
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers(); 

    // HERE           
    AsyncRetryPolicy<HttpResponseMessage> retryPolicy = HttpPolicyExtensions
        .HandleTransientHttpError()
        .Or<TimeoutRejectedException>() // Thrown by Polly's TimeoutPolicy if the inner call gets     timeout.
        .OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.NotFound)
        .WaitAndRetryAsync(6, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));

    var options = new JsonSerializerOptions()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,                
        WriteIndented = true,
    };

    var settings = new RefitSettings()
    {
        ContentSerializer = new SystemTextJsonContentSerializer(options)
    };
    services.AddRefitClient<ICountryApi>(settings)
        .ConfigureHttpClient(c => c.BaseAddress = new Uri(Configuration["MyRefitOptions:BaseAddress"]))
        .AddPolicyHandler(retryPolicy) /*HERE*/
        ;
}
```

## Reference(s)

Most of the information in this article has gathered from various references.

* https://json2csharp.com/
* https://github.com/App-vNext/Polly
* https://github.com/reactiveui/refit
* https://github.com/19balazs86/PlayingWithRefit
* https://github.com/App-vNext/Polly.Extensions.Http
* https://anthonygiretti.com/2019/08/31/building-a-typed-httpclient-with-refit-in-asp-net-core-3/
* https://blog.martincostello.com/refit-and-system-text-json/
* https://www.talkingdotnet.com/3-ways-to-use-httpclientfactory-in-asp-net-core-2-1/
* https://docs.microsoft.com/en-us/dotnet/architecture/microservices/implement-resilient-applications/implement-http-call-retries-exponential-backoff-polly