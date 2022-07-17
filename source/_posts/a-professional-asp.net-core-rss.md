---
title: A Professional ASP.NET Core - RSS
date: October 22 2020
category: aspnetcore
tags:
    - dotnet
    - aspnetcore
    - rss
---

`RSS` feeds provide an excellent mechanism for websites to publish their content for consumption by others.

<!-- more -->

Install the below package

```bash
Install-Package System.ServiceModel.Syndication -Version 4.7.0
dotnet add package System.ServiceModel.Syndication --version 4.7.0
<PackageReference Include="System.ServiceModel.Syndication" Version="4.7.0" />
```

## Create the model

```cs
public class Post
{
    public string Title { get; set; }
    public string UrlSlug { get; set; }
    public string Description { get; set; }
    public DateTime CreatedDate { get; set; }
}
```

## Create the action

Create the action that will respond to the request for our `RSS` Feed.

```cs
using System.ServiceModel.Syndication;
using System.Xml;
using System.IO;
using System.Text;

// Customize this method with your real data.
private IEnumerable<Post> GetBlogPosts()
{
    var posts = new List<Post>();
    posts.Add(new Post()
    {
        Title = "A Professional ASP.NET Core - RSS",
        UrlSlug = "a-professional-asp.net-core-rss",
        Description = "RSS feeds provide an excellent mechanism for websites to publish their content for consumption by others.",
        CreatedDate = new DateTime(2020, 10, 9)
    });
    posts.Add(new Post()
    {
        Title = "A Professional ASP.NET Core API - Caching",
        UrlSlug = "a-professional-asp.net-core-api-caching",
        Description = "Caching is a technique of storing the frequently accessed/used data so that the future requests for those sets of data can be served much faster to the client..",
        CreatedDate = new DateTime(2020, 10, 5)
    });
    posts.Add(new Post()
    {
        Title = "Using Tailwind CSS with Aurelia 2 and Webpack",
        UrlSlug = "aurelia-2-with-tailwindcss-and-webpack",
        Description = "Tailwind CSS is a highly customizable, low-level CSS framework that gives you all of the building blocks you need to build bespoke designs without any annoying opinionated styles you have to fight to override.",
        CreatedDate = new DateTime(2020, 7, 23)
    });
    return posts;
}

// http://localhost:PORT/rss.xml
[ResponseCache(Duration = 1200)]
[HttpGet("/rss.xml")]
public IActionResult Rss()
{
    var feed = new SyndicationFeed("Title", "Description", new Uri("https://hamedfathi.me"), "RSSUrl", DateTime.Now);
    feed.Copyright = new TextSyndicationContent($"{DateTime.Now.Year} Hamed Fathi");
    var items = new List<SyndicationItem>();
    var postings = GetBlogPosts();
    foreach (var item in postings)
    {
        var postUrl = Url.Action("Article", "Blog", new { id = item.UrlSlug }, HttpContext.Request.Scheme);
        var title = item.Title;
        var description = item.Description;
        items.Add(new SyndicationItem(title, description, new Uri(postUrl), item.UrlSlug, item.CreatedDate));
    }
    feed.Items = items;
    var settings = new XmlWriterSettings
    {
        Encoding = Encoding.UTF8,
        NewLineHandling = NewLineHandling.Entitize,
        NewLineOnAttributes = true,
        Indent = true
    };
    using (var stream = new MemoryStream())
    {
        using (var xmlWriter = XmlWriter.Create(stream, settings))
        {
            var rssFormatter = new Rss20FeedFormatter(feed, false);
            rssFormatter.WriteTo(xmlWriter);
            xmlWriter.Flush();
        }
        return File(stream.ToArray(), "application/rss+xml; charset=utf-8");
    }
}
```

The only important note here is that I am setting a `ResponeCache` attribute on this method. I strongly recommend this as your `RSS` Feed generation is often something that will be going to the database etc. and feed-readers are notorious for multiple refreshes etc. By enabling ResponseCaching for your `RSS` action, you can reduce the load on your server.

![](/images/a-professional-asp.net-core-rss/rss.png)


## Fetch RSS feed

You are able to loading and processing the feed.

```cs
using System.ServiceModel.Syndication;
using System.Xml;

public IEnumerable<SyndicationItem> GetFeedItems(string rssUrl)
{
    var reader = XmlReader.Create(rssUrl);
    var feed = SyndicationFeed.Load(reader);
    var posts = feed.Items;
    return posts;
}
```

## RSS Middleware

[Snickler.RSSCore](https://github.com/snickler/RSSCore) was created in order to provide a way to easily generate RSS feeds on the fly via an ASP.NET Core Middleware.

Install the below package

```bash
Install-Package Snickler.RSSCore -Version 2.0.0
dotnet add package Snickler.RSSCore --version 2.0.0
<PackageReference Include="Snickler.RSSCore" Version="2.0.0" />
```

**Create an RSS Provider**

Create a provider class that implements `IRSSProvider` and returns a list of `RSSItem` objects via the `RetrieveSyndicationItems` method.

```cs
public class SomeRSSProvider: IRSSProvider
{
    public Task<IList<RSSItem>> RetrieveSyndicationItems()
    {
        IList<RSSItem> syndicationList = new List<RSSItem>();
        var synd1 = new RSSItem("Sample Title 1", "Sample Content 1")
        {
            PermaLink = new Uri("http://www.sampleaddress.com/sample-content-1"),
            LinkUri = new Uri("http://www.sampleaddress.com/sample-content-1"),
            LastUpdated = DateTime.Now,
            PublishDate = DateTime.Now,
            Categories = new List<string> { ".NET" },
            Authors = new List<string> { "someuser@sampleaddress.com" }
        };

        syndicationList.Add(synd1);

        return Task.FromResult(syndicationList);
    }
}
```

**RSS Feed Configuration**

Add your provider to the service registration in `ConfigureServices` with the `AddRSSFeed` extension

```cs
public void ConfigureServices(IServiceCollection services)
{
	services.AddRSSFeed<SomeRSSProvider>();
	services.AddMvc();
}
```

Set the options for your RSS Feed in `Configure` with `UseRSSFeed`

```cs
public void Configure(IApplicationBuilder app, IHostingEnvironment env)
{
    app.UseRssFeed("/feed", new RSSFeedOptions
    {
        Title = "Snickler's Super Awesome RSS Feed",
        Copyright = "2018",
        Description = "The Best and Most Awesome RSS Feed Content",
        ManagingEditor = "managingeditor@someaddress.com",
        Webmaster = "webmaster@someaddress.com",
        Url = new Uri("http://someaddress.com")
    });
}
```

**Optional RSS Caching Configuration**

By default, MemoryCache is used to cache the feed for 1 day. To be able to update the cache duration or cache key, add a new instance of the `MemoryCacheProvider` to the `Caching` property within the `RSSFeedOptions` class. 

```cs
app.UseRssFeed("/feed", new RSSFeedOptions
{
    Title = "Snickler's Super Awesome RSS Feed",
    Copyright = "2018",
    Description = "The Best and Most Awesome RSS Feed Content",
    ManagingEditor = "managingeditor@someaddress.com",
    Webmaster = "webmaster@someaddress.com",
    Url = new Uri("http://someaddress.com"),
    Caching = new MemoryCacheProvider 
    {
        CacheDuration = TimeSpan.FromDays(5),
        CacheKey = "SomeSuperAwesomeCacheKey"
    }
});
```

## Reference(s)

Most of the information in this article has gathered from various references.

* https://mitchelsellers.com/blog/article/creating-an-rss-feed-in-asp-net-core-3-0
* https://khalidabuhakmeh.com/reading-rss-feeds-with-dotnet-core
* http://www.binaryintellect.net/articles/05fc3052-bf5c-4ab9-b8ab-a7fd6974b977.aspx
* https://github.com/snickler/RSSCore