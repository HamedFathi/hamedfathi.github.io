---
title: A Professional ASP.NET Core API - Caching
date: October 8 2020
category: aspnetcore-api
tags:
    - dotnet
    - aspnetcore
    - webapi
    - cache
    - caching
    - inmemory
    - distributed
    - redis
    - sqlserver
---
 
Caching is a technique of storing the frequently accessed/used data so that the future requests for those sets of data can be served much faster to the client.

In other terms, you take the most frequently used data, which is also least-modified, and copy it temporary storage so that it can be accessed much faster for the future calls from the client. This awesome technique can boost the performance of your application drastically by removing unnecessary and frequent requests to the data source.

It is important to note that applications should be designed in a way that they never depend directly on the cached memory. The Application should use the cache data only if it is available. If the cache data has expired or not available, the application would ideally request the original data source.

<!-- more -->

## Caching in ASP.NET Core

ASP.NET Core has some great out-of-the-box support for various types of caching as follows.

* `In-Memory caching`: Where the data is cached within the server's memory.
* `Distributed caching`: The data is stored external to the application in sources like Redis cache etc.

## In-Memory Caching

With ASP.NET Core, it is now possible to cache the data within the application. This is known as `In-Memory` Caching in ASP.NET Core. The Application stores the data on to the server's instance which in turn drastically improves the application's performance. This is probably the easiest way to implement caching in your application.

**Pros**

* Much quicker than other forms of distributed caching as it avoids communicating over a network.
* Highly reliable.
* Best suited for Small to Mid Scale Applications.

**Cons**

* If configured incorrectly, it can consume your server's resources.
* With the scaling of application and longer caching periods, it can prove to be costly to maintain the server.
* If deployed in the cloud, maintaining consistent caches can be difficult.

## How to add In-Memory caching?

Add `AddMemoryCache` to your services as following

```cs
// Startup.cs

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers();
        
        // HERE
        services.AddMemoryCache();
    }
}
```

## How to use In-Memory caching?

In the Controllers folder, add a new Empty API Controller and name it `CacheController`. Here we will define just 2 endpoints using GET and POST Methods.

The POST Method will be responsible for setting the cache. Now how cache works is quite similar to a C# dictionary. That means you will need 2 parameters, a key, and a value. We will use the key to identify the value (data).

The Cache that we set earlier can be viewed using the GET Endpoint. But this depends on whether the cache is available/expired/exists.

Here is how the controller looks like.

```cs
// CacheRequest.cs

public class CacheRequest
{
    public string Key { get; set; }
    public string Value { get; set; }
}

// CacheController.cs

[Route("api/[controller]")]
[ApiController]
public class CacheController : ControllerBase
{
    private readonly IMemoryCache memoryCache;
    public CacheController(IMemoryCache memoryCache /* HERE */)
    {
        this.memoryCache = memoryCache;
    }
    [HttpGet("{key}")]
    public IActionResult GetCache(string key)
    {
        string value = string.Empty;
        memoryCache.TryGetValue(key, out value);
        return Ok(value);
    }
    [HttpPost]
    public IActionResult SetCache(CacheRequest data)
    {
        var cacheExpiryOptions = new MemoryCacheEntryOptions
        {
            AbsoluteExpiration = DateTime.Now.AddMinutes(5),
            Priority = CacheItemPriority.High,
            SlidingExpiration = TimeSpan.FromMinutes(2),
            Size = 1024,
        };
        memoryCache.Set(data.Key, data.Value, cacheExpiryOptions);
        return Ok();
    }
}
```

**Settings**

`MemoryCacheEntryOptions` is used to define the crucial properties of the concerned caching technique. We will be creating an instance of this class and passing it to the memoryCache object later on.

* `Priority`: Sets the priority of keeping the cache entry in the cache. The default setting is `Normal`. Other options are `High`, `Low` and `Never` Remove. This is pretty self-explanatory.
* `Size`: Allows you to set the size of this particular cache entry, so that it doesn't start consuming the server resources.
* `Sliding Expiration`: A defined Timespan within which a cache entry will expire if it is not used by anyone for this particular time period. In our case, we set it to 2 minutes. If, after setting the cache, no client requests for this cache entry for 2 minutes, the cache will be deleted.
* `Absolute Expiration`: The problem with `Sliding Expiration` is that theoretically, it can last forever. Let's say someone requests for the data every 1.59 minutes for the next couple of days, the application would be technically serving an outdated cache for days together. With `Absolute expiration`, we can set the actual expiration of the cache entry. Here it is set as 5 minutes. So, every 5 minutes, without taking into consideration the sliding expiration, the cache will be expired. It's always a good practice to use both these expirations checks to improve performance.

**Note**: The `Absolute Expiration` *should never be less* than the `Sliding Expiration`.

## Practical In-Memory caching implementation

For testing purposes, I have set up an API and configured Entity Framework Core. This API will return a `list of all customers` in the database.

```cs
[Route("api/[controller]")]
[ApiController]
public class CustomerController : ControllerBase
{
    private readonly IMemoryCache memoryCache;
    private readonly ApplicationDbContext context;
    public CustomerController(IMemoryCache memoryCache, ApplicationDbContext context)
    {
        this.memoryCache = memoryCache;
        this.context = context;
    }
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var cacheKey = "customerList";
        if(!memoryCache.TryGetValue(cacheKey, out List<Customer> customerList))
        {
            customerList = await context.Customers.ToListAsync();
            var cacheExpiryOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpiration = DateTime.Now.AddMinutes(5),
                Priority = CacheItemPriority.High,
                SlidingExpiration = TimeSpan.FromMinutes(2)
            };
            memoryCache.Set(cacheKey, customerList, cacheExpiryOptions);
        }
        return Ok(customerList);
    }
}
```

## Distributed Caching

ASP.NET Core supports not only in-memory application based cache, but also supports `Distribited Caching`. A distributed cache is something external to the application. It does not live within the application and need not be present in the infrastructure of the server machine as well. Distributed cache is a cache that can be shared by one or more applications/servers.
Like in-memory cache, it can improve your application response time quite drastrically. However, the implementation of Distributed Cache is application specific. This means that there are multiple cache providers that support distributed caches.

**Pros**

* Data is consistent throughout multiple servers.
* Multiple Applications / Servers can use one instance of Redis Server to cache data. This reduces the cost of maintanence in the longer run.
* Cache would not be lost on server restart and application deployment as the cache lives external to the application.
* It does not use local server's resources.

**Cons**

* Since it is kept external, the response time may be a bit slower depending on the connection strength to the redis server.

## Distributed memory cache

To keep in line with other distributed memory cache providers that follow `IDistributedCache` interface there is also implementation of memory cache that follows the same interface. `MemoryDistributedCache` class is wrapper around `IMemoryCache` and we can use it as any other distributed cache.

**IDistributedCache interface**

| Method(s) | Description |
|-----------|-------------|
|Get, GetAsync|Accepts a string key and retrieves a cached item as a `byte[]` array if found in the cache.|
|Set, SetAsync|Adds an item (as `byte[]` array) to the cache using a string key.|
|Refresh, RefreshAsync|Refreshes an item in the cache based on its key, resetting its sliding expiration timeout (if any).|
|Remove, RemoveAsync|Removes a cache item based on its string key.|

**How to add Distributed caching?**

Add `AddDistributedMemoryCache` to your services as following

```cs
// Startup.cs

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers();
        
        // HERE
        services.AddDistributedMemoryCache();
    }
}
```

For example

```cs
// CacheRequest.cs

public class CacheRequest
{
    public string Key { get; set; }
    public byte[] Value { get; set; }
}

// CacheController.cs

[Route("api/[controller]")]
[ApiController]
public class CacheController : ControllerBase
{
    private readonly IDistributedCache _distributedCache;
    public CacheController(IDistributedCache distributedCache /* HERE */)
    {
        this._distributedCache = distributedCache;
    }
    [HttpGet("{key}")]
    public IActionResult GetCache(string key)
    {
       var value = _distributedCache.Get(key);
        // ...
        return Ok(/* Your object */);
    }
    [HttpPost]
    public IActionResult SetCache(CacheRequest data)
    {
        _distributedCache.Set(data.Key, data.Value);
        // ...
        return Ok(/* Your object */);
    }
}
```

There are some useful extension methods to convert your object to byte array and vice versa.

```cs
// ByteArrayExtensions.cs

using System.IO;
using System.Runtime.Serialization.Formatters.Binary;

public static class ByteArrayExtensions
{
    public static byte[] ToByteArray<T>(this T obj)
    {
        if (obj == null)
            return null;
        BinaryFormatter bf = new BinaryFormatter();
        using (MemoryStream ms = new MemoryStream())
        {
            bf.Serialize(ms, obj);
            return ms.ToArray();
        }
    }

    public static T FromByteArray<T>(this byte[] data)
    {
        if (data == null)
            return default(T);
        BinaryFormatter bf = new BinaryFormatter();
        using (MemoryStream ms = new MemoryStream(data))
        {
            object obj = bf.Deserialize(ms);
            return (T)obj;
        }
    }
}
```

## In-Memory cache or Distributed memory cache?

Using `In-Memory` cache is the option for systems running on single box. Also in development environments we could prefer In-Memory based cache to keep external services away when building the system. I think that going with `IDistributedCache` is better idea as there is no need for changes in controllers and other parts of application when distributed cache provider is changed. In cloud and multi-box environments some implementation of distributed cache is a must as local caches on web server are not synchronized.

So, The Distributed Memory Cache is a useful implementation:

* In development and testing scenarios.
* When a single server is used in production and memory consumption isn't an issue. Implementing the Distributed Memory Cache abstracts cached data storage. It allows for implementing a true distributed caching solution in the future if multiple nodes or fault tolerance become necessary.

## Distributed SQL Server Cache

The Distributed SQL Server Cache implementation (`AddDistributedSqlServerCache`) allows the distributed cache to use a SQL Server database as its backing store. To create a SQL Server cached item table in a SQL Server instance, you can use the `sql-cache` tool. The tool creates a table with the name and schema that you specify.

Create a table in SQL Server by running the `sql-cache create` command. Provide the SQL Server instance (`Server`), database (`Database`), schema (for example, `dbo`), and table name (for example, `TestCache`):

```bash
dotnet tool install --global dotnet-sql-cache --version 3.1.8

dotnet sql-cache create "Server=.;Database=DistCache;User Id=sa;Password=1234567;" dbo TestCache
```

A message is logged to indicate that the tool was successful:

```
Table and index were created successfully.
```

The sample app implements `SqlServerCache` in a non-Development environment in `Startup.ConfigureServices`:

```cs
// Startup.ConfigureServices

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers();
        
        // HERE
        services.AddDistributedSqlServerCache(options =>
        {
            options.ConnectionString = Configuration["DistCache_ConnectionString"];
            options.SchemaName = "dbo";
            options.TableName = "TestCache";
        });
    }
}
```

And inside `appsettings.json`

```json
{
  "DistCache_ConnectionString": "Server=.;Database=DistCache;User Id=sa;Password=1234567;"
}
```

## Distributed Redis Cache

`Redis` is an open source data store that is used as a database, cache / messaging broker. It supports quite a lot of data structures like string, hashes, lists,, queries and much more. It's a blazing fast key-value based database that is written in C. It's a NoSQL Database as well, which is awesome. For these purposes, it is being used at techgiants like Stackoverflow, Flickr, Github and so on.

`Redis` is a great option for implementing highly available cache to reduce the data access latency and improve the application response time. As a result, we can reduce the load off our database to a very good extent.

Install below package

```cs
Install-Package Microsoft.Extensions.Caching.StackExchangeRedis -Version 3.1.8
dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis --version 3.1.8
<PackageReference Include="Microsoft.Extensions.Caching.StackExchangeRedis" Version="3.1.8" />
```

Register `Redis` as following:

```cs
// Startup.ConfigureServices

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers();
        
        // HERE
        services.AddStackExchangeRedisCache(options =>
        {
            // By default, Redis runs on the local 6379 port.
            options.Configuration = "localhost:6379";
        });
    }
}
```

You can use it inside controller

```cs
[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    private readonly IDistributedCache _distributedCache;

    public WeatherForecastController(IDistributedCache distributedCache)
    {
        _distributedCache = distributedCache;
        // SET
        var options = new DistributedCacheEntryOptions()
            .SetAbsoluteExpiration(DateTime.Now.AddMinutes(10))
            .SetSlidingExpiration(TimeSpan.FromMinutes(2));
        _distributedCache.Set("test", "Hello".ToByteArray(), options);
    }

    [HttpGet]
    public string Get()
    {
        // GET
        var value = _distributedCache.Get("test").FromByteArray<string>();
        return value;
    }
}
```

**DistributedCacheEntryOptions**

* `SetAbsoluteExpiration`: You can set the expiration time of the cache object.
* `SetSlidingExpiration`: This is similar to the `Absolute Expiration`. It expires a cache object if it not being requested for a defined amount of time period.

**Note**: The `Absolute Expiration` *should never be less* than the `Sliding Expiration`.

## Reference(s)

Most of the information in this article has gathered from various references.

* https://www.codewithmukesh.com/blog/in-memory-caching-in-aspnet-core/
* https://www.codewithmukesh.com/blog/redis-caching-in-aspnet-core/
* https://docs.microsoft.com/en-us/aspnet/core/performance/caching/distributed
* https://gunnarpeipman.com/aspnet-core-memory-cache/
* https://www.codewithmukesh.com/blog/redis-caching-in-aspnet-core/