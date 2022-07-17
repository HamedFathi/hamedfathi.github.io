---
title: Awesome .NET!
date: October 1 2020
category: dotnet
tags:
    - dotnet
    - awesome
---

A collection of awesome `.NET` libraries, tools, frameworks, and software that I suggest you try!

<!-- more -->

## Logging

> Simple .NET logging with fully-structured events.

[Serilog](https://www.nuget.org/packages/Serilog/)

[Serilog.Extensions.Logging](https://www.nuget.org/packages/Serilog.Extensions.Logging/)

[Serilog.Exceptions](https://www.nuget.org/packages/Serilog.Exceptions/)

[Serilog.Sinks.RollingFile](https://www.nuget.org/packages/Serilog.Sinks.RollingFile)

[Serilog.Sinks.File](https://www.nuget.org/packages/Serilog.Sinks.File/)

[Serilog.Sinks.Console](https://www.nuget.org/packages/Serilog.Sinks.Console)

[Serilog.Sinks.ColoredConsole](https://www.nuget.org/packages/Serilog.Sinks.ColoredConsole/)

[Serilog.Sinks.LiteDB](https://www.nuget.org/packages/Serilog.Sinks.LiteDB/)

---
## Inversion of Control (IoC)

> Grace is a feature rich dependency injection container library

[Grace](https://www.nuget.org/packages/Grace/)

[Grace.AspNetCore.Hosting](https://www.nuget.org/packages/Grace.AspNetCore.Hosting)

[Grace.AspNetCore.MVC](https://www.nuget.org/packages/Grace.AspNetCore.MVC)

[Grace.Dynamic](https://www.nuget.org/packages/Grace.Dynamic/)

[Grace.Factory](https://www.nuget.org/packages/Grace.Factory/)

> DryIoc is fast, small, full-featured IoC Container for .NET

[DryIoc](https://www.nuget.org/packages/DryIoc.dll/)

[DryIoc.Microsoft.DependencyInjection](https://www.nuget.org/packages/DryIoc.Microsoft.DependencyInjection/)

---
## Serialization

> Popular high-performance JSON framework for .NET

[Newtonsoft.Json](https://www.nuget.org/packages/Newtonsoft.Json/)

> JSON Schema draft v4 reader, generator and validator for .NET.

[NJsonSchema](https://www.nuget.org/packages/NJsonSchema)

[NJsonSchema.CodeGeneration](https://www.nuget.org/packages/NJsonSchema.CodeGeneration)

[NJsonSchema.CodeGeneration.CSharp](https://www.nuget.org/packages/NJsonSchema.CodeGeneration.CSharp)

[NJsonSchema.CodeGeneration.TypeScript](https://www.nuget.org/packages/NJsonSchema.CodeGeneration.TypeScript)

> Classes to serialize, deserialize and validate OData JSON payloads. Supports OData v4 only. Enables construction of OData services and clients.

[Microsoft.OData.Core](https://www.nuget.org/packages/Microsoft.OData.Core/)

[Microsoft.AspNetCore.OData](https://www.nuget.org/packages/Microsoft.AspNetCore.OData/)

> A library for reading and writing CSV files. Extremely fast, flexible, and easy to use. Supports reading and writing of custom class objects.

[CsvHelper](https://www.nuget.org/packages/CsvHelper/)

> protobuf-net is a contract based serializer for .NET code, that happens to write data in the "protocol buffers" serialization format engineered by Google. The API, however, is very different to Google's, and follows typical .NET patterns (it is broadly comparable, in usage, to XmlSerializer, DataContractSerializer, etc). It should work for most .NET languages that write standard types and can use attributes.

[protobuf-net](https://www.nuget.org/packages/protobuf-net/)

> Extended Xml Serializer for .NET

[ExtendedXmlSerializer](https://www.nuget.org/packages/ExtendedXmlSerializer)

[ExtendedXmlSerializer.AspCore](https://www.nuget.org/packages/ExtendedXmlSerializer.AspCore/)

[ExtendedXmlSerializer.Autofac](https://www.nuget.org/packages/ExtendedXmlSerializer.Autofac/)

> A YAML portable .NET library. providing parsing and serialization of object graphs, compatible with CoreCLR.

[SharpYaml](https://www.nuget.org/packages/SharpYaml)

> Fastest C# Serializer and Infinitely Fast Deserializer for .NET, .NET Core and Unity.

[ZeroFormatter](https://www.nuget.org/packages/ZeroFormatter)

> Definitely Fastest and Zero Allocation JSON Serializer for C#(NET, .NET Core, Unity, Xamarin).

[Utf8Json](https://www.nuget.org/packages/Utf8Json)

[Utf8Json.ImmutableCollection](https://www.nuget.org/packages/Utf8Json.ImmutableCollection)

[Utf8Json.AspNetCoreMvcFormatter](https://www.nuget.org/packages/Utf8Json.AspNetCoreMvcFormatter)

---
## Test-driven development (TDD) -  Behavior-driven development (BDD)

> xUnit.net is a developer testing framework, built to support Test Driven Development, with a design goal of extreme simplicity and alignment with framework features.

[xunit](https://www.nuget.org/packages/xunit/)

> NSubstitute is a friendly substitute for .NET mocking frameworks. It has a simple, succinct syntax to help developers write clearer tests. NSubstitute is designed for Arrange-Act-Assert (AAA) testing and with Test Driven Development (TDD) in mind.

[NSubstitute](https://www.nuget.org/packages/NSubstitute/)

> Moq is the most popular and friendly mocking framework for .NET

[Moq](https://www.nuget.org/packages/Moq/)

> A BDD style testing framework, heavily relying on (auto mocking) containers.

[Chill](https://www.nuget.org/packages/Chill)

> xBehave.net is xUnit.net extension for describing your tests using natural language. Ideally suited to a variety of testing styles (e.g. BDD, TDD, ATDD, etc.), xBehave.net can be used for acceptance tests, integration tests, unit tests or any other ad-hoc testing scenarios.

[xBehave](https://www.nuget.org/packages/Xbehave/)

> LightBDD is a behaviour-driven development test framework offering ability to write tests that are easy to read, easy to track during execution and summarize in user friendly report, while allowing developers to use all of the standard development tools to maintain them.

[LightBDD.XUnit2](https://www.nuget.org/packages/LightBDD.XUnit2/)

> Fluent Assertions is a set of .NET extension methods that allow you to more naturally specify the expected outcome of a TDD or BDD-style test. We currently use it in all our internal and client projects, and it is used in many open-source projects. It runs on .NET 4.0, 4.5, 4.6, CoreClr, .NET Native, Windows 8.1, Silverlight 5, Windows Phone 8.0…

[FluentAssertions](https://www.nuget.org/packages/FluentAssertions)

[FluentAssertions.Json](https://www.nuget.org/packages/FluentAssertions.Json/)

[FluentAssertions.Autofac](https://www.nuget.org/packages/FluentAssertions.Autofac/)

> The Tynamix ObjectFiller.NET fills the properties of your objects with random data. Use it for unittest, prototyping and whereever you need some random testdata. It has a fluent API and is highly customizable. It supports also IEnumerables and Dictionaries and constructors WITH parameters. It is also possible to fill instances and to write private properties.

[ObjectFiller](https://www.nuget.org/packages/Tynamix.ObjectFiller/)

> A simple and sane data generator for populating objects that supports different locales. A delightful port of the famed faker.js and inspired by FluentValidation. Use it to create and load databases and UIs with mock up data. Get started by using Faker class or a DataSet directly.

[Bogus](https://www.nuget.org/packages/Bogus/)

> Easy integration testing helper for ASP.Net Core applications.

[Alba](https://www.nuget.org/packages/Alba/)

> Coverlet is a cross platform code coverage library for .NET Core, with support for line, branch and method coverage.

[Coverlet](https://www.nuget.org/packages/coverlet.msbuild/)

---
## Message Brokers

> RawRabbit is a modern .NET client for communication over RabbitMq. It is written for .NET Core and uses Microsoft’s new frameworks for logging, configuration and dependecy injection.

[RawRabbit](https://www.nuget.org/packages/RawRabbit)

[RawRabbit.Extensions](https://www.nuget.org/packages/RawRabbit.Extensions/)

[RawRabbit.Attributes](https://www.nuget.org/packages/RawRabbit.Attributes/)

[RawRabbit.DependencyInjection.Autofac](https://www.nuget.org/packages/RawRabbit.DependencyInjection.Autofac/)

[RawRabbit.Logging.Serilog](https://www.nuget.org/packages/RawRabbit.Logging.Serilog/)

[RawRabbit.Operations.StateMachine](https://www.nuget.org/packages/RawRabbit.Operations.StateMachine/)

[RawRabbit.Enrichers.Polly](https://www.nuget.org/packages/RawRabbit.Enrichers.Polly/)

> An easy to use .NET API for RabbitMQ

[EasyNetQ](https://www.nuget.org/packages/EasyNetQ)

[EasyNetQ.Management.Client](https://www.nuget.org/packages/EasyNetQ.Management.Client/)

> Rebus is a lean service bus implementation for .NET.

[Rebus](https://www.nuget.org/packages/Rebus)

[Rebus.RabbitMQ](https://www.nuget.org/packages/Rebus.RabbitMq/)

[Rebus.Serilog](https://www.nuget.org/packages/Rebus.Serilog/)

[Rebus.SqlServer](https://www.nuget.org/packages/Rebus.SqlServer/)

[Rebus.PostgreSql](https://www.nuget.org/packages/Rebus.PostgreSql/)

[Rebus.MongoDb](https://www.nuget.org/packages/Rebus.MongoDb/)

[Rebus.Async](https://www.nuget.org/packages/Rebus.Async/)

---
## Object-relational mapping (ORM)

> A high performance Micro-ORM supporting SQL Server, MySQL, Sqlite, SqlCE, Firebird etc..

[Dapper](https://www.nuget.org/packages/Dapper/)

[Moq.Dapper](https://www.nuget.org/packages/Moq.Dapper/)

> Entity Framework Core is a lightweight and extensible version of the popular Entity Framework data access technology.

[Microsoft.EntityFrameworkCore](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore/)

[Microsoft.EntityFrameworkCore.Design](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.Design/)

[Microsoft.EntityFrameworkCore.Relational](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.Relational/)

[Microsoft.EntityFrameworkCore.Relational.Design](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.Relational.Design/)

[Microsoft.EntityFrameworkCore.InMemory](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.InMemory/)

[Microsoft.EntityFrameworkCore.Tools](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.Tools/)

[Microsoft.EntityFrameworkCore.Tools.DotNet](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.Tools.DotNet/)

[Microsoft.EntityFrameworkCore.Specification.Tests](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.Specification.Tests/)

[Microsoft.EntityFrameworkCore.Relational.Specification.Tests](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.Relational.Specification.Tests/)

[Microsoft.EntityFrameworkCore.Relational.Design.Specification.Tests](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.Relational.Design.Specification.Tests/)

[EFSecondLevelCache.Core](https://www.nuget.org/packages/EFSecondLevelCache.Core/)

[EntityFrameworkCore.Triggers](https://www.nuget.org/packages/EntityFrameworkCore.Triggers/)

[EntityFrameworkCore.Rx](https://www.nuget.org/packages/EntityFrameworkCore.Rx/)

[Woodman.EntityFrameworkCore.Bulk](https://www.nuget.org/packages/Woodman.EntityFrameworkCore.Bulk/)

[Microsoft.EntityFrameworkCore.AutoHistory](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.AutoHistory/)

[EfCore.InMemoryHelpers](https://github.com/SimonCropp/EfCore.InMemoryHelpers)

[EntityFrameworkCore.PrimaryKey](https://www.nuget.org/packages/EntityFrameworkCore.PrimaryKey/)

[EntityFrameworkCore.TypedOriginalValues](https://www.nuget.org/packages/EntityFrameworkCore.TypedOriginalValues/)

> Microsoft SQL Server is a relational database management system developed by Microsoft. As a database server, it is a software product with the primary function of storing and retrieving data as requested by other software applications.

[Microsoft.EntityFrameworkCore.SqlServer](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.SqlServer/)

[Microsoft.EntityFrameworkCore.SqlServer.Design](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.SqlServer.Design)

> SQLite is a self-contained, high-reliability, embedded, full-featured, public-domain, SQL database engine. SQLite is the most used database engine in the world.

[Microsoft.Data.Sqlite](https://www.nuget.org/packages/Microsoft.Data.Sqlite/)

[Microsoft.EntityFrameworkCore.Sqlite](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.Sqlite/)

[Microsoft.EntityFrameworkCore.Sqlite.Design](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.Sqlite.Design/)

> PostgreSQL, often simply Postgres, is an object-relational database management system (ORDBMS) with an emphasis on extensibility and standards compliance. As a database server, its primary functions are to store data securely and return that data in response to requests from other software applications.

[Npgsql](https://www.nuget.org/packages/Npgsql/)

[Npgsql.EntityFrameworkCore.PostgreSQL](https://www.nuget.org/packages/Npgsql.EntityFrameworkCore.PostgreSQL/)

[Npgsql.EntityFrameworkCore.PostgreSQL.Design](https://www.nuget.org/packages/Npgsql.EntityFrameworkCore.PostgreSQL.Design/)

> Library to create and use COMB (timestamped sequential) GUID variants for Microsoft SQL Server and PostgreSQL.

[RT.Comb](https://www.nuget.org/packages/RT.Comb/)

---
## Aspect-oriented programming (AOP)

> Cecil is a library written by Jb Evain to generate and inspect programs and libraries in the ECMA CIL format. It has full support for generics, and support some debugging symbol format. In simple English, with Cecil, you can load existing managed assemblies, browse all the contained types, modify them on the fly and save back to the disk the modified assembly.

[Mono.Cecil](https://www.nuget.org/packages/Mono.Cecil/)

> Castle Core provides common Castle Project abstractions including logging services. It also features Castle DynamicProxy a lightweight runtime proxy generator, and Castle DictionaryAdapter.

[Castle.Core](https://www.nuget.org/packages/Castle.Core)

> Extensible tool for weaving .net assemblies

[Fody](https://www.nuget.org/packages/Fody/)

---
## Validation

> A validation library for .NET that uses a fluent interface to construct strongly-typed validation rules.

[FluentValidation](https://www.nuget.org/packages/FluentValidation)

[FluentValidation.AspNetCore](https://www.nuget.org/packages/FluentValidation.AspNetCore/)

---
## Distributed Systems

> Build powerful concurrent & distributed applications more easily.

[Akka](https://www.nuget.org/packages/Akka)

[Akka.Logger.Serilog](https://www.nuget.org/packages/Akka.Logger.Serilog/)

[Akka.DI.AutoFac](https://www.nuget.org/packages/Akka.DI.AutoFac/)

[Akka.TestKit.Xunit2](https://www.nuget.org/packages/Akka.TestKit.Xunit2/)

[Akka.Persistence.SqlServer](https://www.nuget.org/packages/Akka.Persistence.SqlServer/)

> Orleans is a framework that provides a straight-forward approach to building distributed high-scale computing applications, without the need to learn and apply complex concurrency or other scaling patterns.

[Microsoft.Orleans.Core](https://www.nuget.org/packages/Microsoft.Orleans.Core)

[Microsoft.Orleans.Client](https://www.nuget.org/packages/Microsoft.Orleans.Client)

[Microsoft.Orleans.Server](https://www.nuget.org/packages/Microsoft.Orleans.Server)

---
## Scheduling

> Quartz Scheduling Framework for .NET

[Quartz.NET](https://www.nuget.org/packages/Quartz/)

---
## NoSQL
> Embedded .NET NoSQL Document Store in a single data file

[LiteDB](https://www.nuget.org/packages/LiteDB)

> High performance Redis client, incorporating both synchronous and asynchronous usage.

[StackExchange.Redis](https://www.nuget.org/packages/StackExchange.Redis/)

> Official .NET driver for MongoDB.

[MongoDB.Driver](https://www.nuget.org/packages/MongoDB.Driver/)

> Postgresql as a Document Database and Event Store for .Net Applications.

[Marten](https://www.nuget.org/packages/Marten/)

> A C#/.NET RethinkDB database driver with 100% ReQL API coverage. Architecturally, this driver is a port of the official Java driver.

[RethinkDb.Driver](https://www.nuget.org/packages/RethinkDb.Driver/)

---
## Object Mapper

> A convention-based object-object mapper. AutoMapper uses a fluent configuration API to define an object-object mapping strategy. AutoMapper uses a convention-based matching algorithm to match up source to destination values. Currently, AutoMapper is designed for model projection scenarios to flatten complex object models to DTOs and other simple objects, whose design is better suited for serialization, communication, messaging, or simply an anti-corruption layer between the domain and application layer.

[AutoMapper](https://www.nuget.org/packages/AutoMapper/)

[AutoMapper.Data](https://www.nuget.org/packages/AutoMapper.Data/)

[AutoMapper.Extensions.Microsoft.DependencyInjection](https://www.nuget.org/packages/AutoMapper.Extensions.Microsoft.DependencyInjection/)

---
## Html Manipulation

> This is an agile HTML parser that builds a read/write DOM and supports plain XPATH or XSLT (you actually don't HAVE to understand XPATH nor XSLT to use it, don't worry...). It is a .NET code library that allows you to parse "out of the web" HTML files. The parser is very tolerant with "real world" malformed HTML. The object model is very similar to what proposes System.Xml, but for HTML documents (or streams).

[HtmlAgilityPack](https://www.nuget.org/packages/HtmlAgilityPack/)

---
## Caching

> CacheManager is an open source caching abstraction layer for .NET written in C#. It supports various cache providers and implements many advanced features. The main goal of the CacheManager package is to make developer's life easier to handle even very complex caching scenarios.
With CacheManager it is possible to implement multiple layers of caching, e.g. in-process caching in front of a distributed cache, in just a few lines of code. CacheManager is not just an interface to unify the programming model for various cache providers, which will make it very easy to change the caching strategy later on in a project. It also offers additional features, like cache synchronization, concurrent updates, serialization, events, performance counters... The developer can opt-in to those features only if needed.

[CacheManager.Core](https://www.nuget.org/packages/CacheManager.Core/)

[CacheManager.Microsoft.Extensions.Logging](https://www.nuget.org/packages/CacheManager.Microsoft.Extensions.Logging/)

[CacheManager.Microsoft.Extensions.Configuration](https://www.nuget.org/packages/CacheManager.Microsoft.Extensions.Configuration/)

[CacheManager.Microsoft.Extensions.Caching.Memory](https://www.nuget.org/packages/CacheManager.Microsoft.Extensions.Caching.Memory/)

[CacheManager.SystemRuntimeCaching](https://www.nuget.org/packages/CacheManager.SystemRuntimeCaching/)

[CacheManager.Serialization.Json](https://www.nuget.org/packages/CacheManager.Serialization.Json/)

[CacheManager.StackExchange.Redis](https://www.nuget.org/packages/CacheManager.StackExchange.Redis/)

[CacheManager.Serialization.ProtoBuf](https://www.nuget.org/packages/CacheManager.Serialization.ProtoBuf/)

> Lazy cache is a simple,thread safe in-memory caching service

[LazyCache](https://www.nuget.org/packages/LazyCache/)

---
## Lexer/Parser Frameworks

> Tiny C# Monadic Parser Framework

[Sprache](https://www.nuget.org/packages/Sprache)

> A parser combinator library for C#

[Superpower](https://www.nuget.org/packages/Superpower)

> ANTLR (ANother Tool for Language Recognition) is a powerful parser generator for reading, processing, executing, or translating structured text or binary files.

[Antlr4.Runtime.Standard](https://www.nuget.org/packages/Antlr4.Runtime.Standard/)

---
## Command Line Parsers

> The ultimate command line application framework

[PowerArgs](https://www.nuget.org/packages/PowerArgs/)

---
## Bot Framework

> Microsoft Bot Builder is a powerful framework for constructing bots that can handle both freeform interactions and more guided ones where the possibilities are explicitly shown to the user. It is easy to use and leverages C# to provide a natural way to write bots.

[Microsoft.Bot.Builder](https://www.nuget.org/packages/Microsoft.Bot.Builder/)

[Microsoft.Bot.Builder.Integration.AspNet.Core](https://www.nuget.org/packages/Microsoft.Bot.Builder.Integration.AspNet.Core/)

[Bot Framework Emulator](https://github.com/Microsoft/BotFramework-Emulator)

---
## Build Systems

> The Microsoft Build Engine (MSBuild) is the build platform for .NET and Visual Studio.

[Microsoft.Build](https://www.nuget.org/packages/Microsoft.Build/)

[Microsoft.Build.Runtime](https://www.nuget.org/packages/Microsoft.Build.Runtime/)

[Microsoft.Build.Engine](https://www.nuget.org/packages/Microsoft.Build.Engine/)

[Microsoft.Build.Utilities.Core](https://www.nuget.org/packages/Microsoft.Build.Utilities.Core/)

[Microsoft.Build.Tasks.Core](https://www.nuget.org/packages/Microsoft.Build.Tasks.Core/)

[Microsoft.Build.Conversion.Core](https://www.nuget.org/packages/Microsoft.Build.Conversion.Core/)

[Microsoft.Build.Localization](https://www.nuget.org/packages/Microsoft.Build.Localization/)

> NuGet is a free and open-source package manager designed for the Microsoft development platform.

[NuGet.Frameworks](https://www.nuget.org/packages/NuGet.Frameworks/)

> A cross-platform build automation system with C# DSL.

[Nuke.Core](https://www.nuget.org/packages/Nuke.Core/)

> Cake (C# Make) is a cross platform build automation system with a C# DSL to do things like compiling code, copy files/folders, running unit tests, compress files and build NuGet packages.

[Cake](https://www.nuget.org/packages/Cake/)

---
## Report Engines

> PdfReport.Core is a code first reporting engine, which is built on top of the iTextSharp.LGPLv2.Core and EPPlus.Core libraries.

[PdfRpt.Core](https://www.nuget.org/packages/PdfRpt.Core/)

---
## Cryptography

> The Bouncy Castle Crypto package is a C# implementation of cryptographic algorithms and protocols, it was developed by the Legion of the Bouncy Castle, a registered Australian Charity, with a little help! The Legion, and the latest goings on with this package, can be found at http://www.bouncycastle.org. In addition to providing basic cryptography algorithms, the package also provides support for CMS, TSP, X.509 certificate generation and a variety of other standards such as OpenPGP.

[Portable.BouncyCastle](https://www.nuget.org/packages/Portable.BouncyCastle/)

> FNV-1a hash algorithm in C#

[Aesop.Fnv1a](https://www.nuget.org/packages/Aesop.Fnv1a/)

> bcrypt is a password hashing function designed by Niels Provos and David Mazières, based on the Blowfish cipher, and presented at USENIX in 1999.[1] Besides incorporating a salt to protect against rainbow table attacks, bcrypt is an adaptive function: over time, the iteration count can be increased to make it slower, so it remains resistant to brute-force search attacks even with increasing computation power.

[BCrypt.Net-Core](https://www.nuget.org/packages/BCrypt.Net-Core/)

> Rijndael256 makes encrypting data and files a breeze with the AES symmetric-key cipher Rijndael.

[Rijndael256.Core](https://www.nuget.org/packages/Rijndael256.Core/)

> Fast version of Crc32 & Crc32C algorithms for .NET and .NET Core. It is up to 3x-5x times better than other "fast" implemenations. Code based on Crc32C.NET library.

[Crc32.NET](https://www.nuget.org/packages/Crc32.NET/)

> Jwt.Net, a JWT (JSON Web Token) implementation for .NET

[JWT](https://www.nuget.org/packages/JWT)

> Managed .NET wrapper for unmanaged PKCS#11 libraries

[Pkcs11Interop](https://www.nuget.org/packages/Pkcs11Interop/)

---
## Benchmarks

> BenchmarkDotNet is a powerful .NET library for benchmarking. Benchmarking is really hard (especially microbenchmarking), you can easily make a mistake during performance measurements. BenchmarkDotNet will protect you from the common pitfalls (even for experienced developers) because it does all the dirty work for you: it generates an isolated project per each benchmark method, does several launches of this project, run multiple iterations of the method (include warm-up), and so on. Usually, you even shouldn't care about a number of iterations because BenchmarkDotNet chooses it automatically to achieve the requested level of precision.

[BenchmarkDotNet](https://www.nuget.org/packages/BenchmarkDotNet/)

> App Metrics is an open-source .NET Standard library used to record application metrics.

[App.Metrics](https://www.nuget.org/packages/App.Metrics/)

---
## Template Engines

> DotLiquid is a templating system ported to the .NET framework from Ruby’s Liquid Markup.

[DotLiquid](https://www.nuget.org/packages/DotLiquid/)

> A fast, powerful, safe and lightweight text templating language and engine for .NET

[Scriban](https://www.nuget.org/packages/Scriban/)

> A fast, powerful, CommonMark compliant, extensible Markdown processor for .NET

[Markdig.NET](https://www.nuget.org/packages/Markdig/)

---
## Reactive Extensions (Rx)

> In computing, reactive programming is an asynchronous programming paradigm concerned with data streams and the propagation of change. This means that it becomes possible to express static (e.g. arrays) or dynamic (e.g. event emitters) data streams with ease via the employed programming language(s), and that an inferred dependency within the associated execution model exists, which facilitates the automatic propagation of the change involved with data flow.

[System.Reactive](https://www.nuget.org/packages/System.Reactive)

[System.Reactive.Linq](https://www.nuget.org/packages/System.Reactive.Linq/)

[System.Interactive](https://www.nuget.org/packages/System.Interactive/)

> Reactive collections based on Rx.Net

[DynamicData](https://www.nuget.org/packages/DynamicData/)

---
## Command Query Responsibility Segregation (CQRS)

> Simple, unambitious mediator implementation in .NET.

[MediatR](https://www.nuget.org/packages/MediatR/)

[MediatR.Extensions.Microsoft.DependencyInjection](https://www.nuget.org/packages/MediatR.Extensions.Microsoft.DependencyInjection/)

---
## Docker

> Docker is an open platform for developers and sysadmins to build, ship, and run distributed applications, whether on laptops, data center VMs, or the cloud.

[Docker.DotNet](https://www.nuget.org/packages/Docker.DotNet/)

[Docker.DotNet.BasicAuth](https://www.nuget.org/packages/Docker.DotNet.BasicAuth/)

[Docker.DotNet.X509](https://www.nuget.org/packages/Docker.DotNet.X509/)

---
## Exception Handling

> Polly is a .NET 4.5 / .NET Standard 1.1 library that allows developers to express resilience and transient fault handling policies such as Retry, Circuit Breaker, Timeout, Bulkhead Isolation and Fallback in a fluent and thread-safe manner.

[Polly](https://www.nuget.org/packages/Polly/)

---
## Workflow Engines

> Create state machines and lightweight state machine-based workflows directly in .NET code

[Stateless](https://www.nuget.org/packages/Stateless)

---
## Reflection/Expression 

> In .NET reflection is slow... well, kinda slow. If you need access to the members of an arbitrary type, with the type and member-names known only at runtime - then it is frankly hard (especially for DLR types). This library makes such access easy and fast.

[FastMember](https://www.nuget.org/packages/FastMember/)

> Tired of slow .NET Reflection API? This package will let you get rid of this overhead by replacing Reflection calls with much faster delegates. 

[DelegatesFactory](https://www.nuget.org/packages/DelegatesFactory/)

> Expression tree compilation is used by wide range of tools, e.g. IoC/DI containers, Serializers, OO Mappers. But the performance of compilation with Expression.Compile() is just slow. Moreover, the compiled delegate may be slower than manually created delegate.

[FastExpressionCompiler](https://www.nuget.org/packages/FastExpressionCompiler)

---
## DateTime

> Noda Time is a date and time API acting as an alternative to the built-in DateTime/DateTimeOffset etc types built into the .NET framework.

[NodaTime](https://www.nuget.org/packages/NodaTime/)

[NodaTime.Serialization.JsonNet](https://www.nuget.org/packages/NodaTime.Serialization.JsonNet/)

> Extensive time period calculations and individual calendar periods.

[TimePeriodLibrary.NET](https://www.nuget.org/packages/TimePeriodLibrary.NET/)

> This project is a merge of several common DateTime operations on the form of extensions to System.DateTime, including natural date difference text (precise and human rounded), holidays and working days calculations on several culture locales. Feedback will be much appreciated.

[DateTimeExtensions](https://www.nuget.org/packages/DateTimeExtensions/)

---
## Search Engines

> Strongly typed interface to Elasticsearch. Fluent and classic object initializer mappings of requests and responses. Uses and exposes Elasticsearch.Net

[NEST](https://www.nuget.org/packages/NEST/)

> Lucene.Net is a full-text search engine library capable of advanced text analysis, indexing, and searching. It can be used to easily add search capabilities to applications.

[Lucene.Net](https://www.nuget.org/packages/Lucene.Net/)

[Lucene.Net.Queries](https://www.nuget.org/packages/Lucene.Net.Queries)

---
## Object Tracking

> Generate tracking information about an operation being executed.

[Audit.NET](https://www.nuget.org/packages/Audit.NET/)

[Audit.NET.SqlServer](https://www.nuget.org/packages/Audit.NET.SqlServer/)

[Audit.NET.Redis](https://www.nuget.org/packages/Audit.NET.Redis/)

[Audit.NET.MongoDB](https://www.nuget.org/packages/Audit.NET.MongoDB/)

---
## Identity Managers

> ASP.NET Core Identity is the membership system for building ASP.NET Core web applications, including membership, login, and user data. ASP.NET Core Identity allows you to add login features to your application and makes it easy to customize data about the logged in user.

[Microsoft.AspNetCore.Identity](https://www.nuget.org/packages/Microsoft.AspNetCore.Identity/)

[Microsoft.AspNetCore.Identity.EntityFrameworkCore](https://www.nuget.org/packages/Microsoft.AspNetCore.Identity.EntityFrameworkCore/)

[Microsoft.AspNetCore.Identity.Service](https://www.nuget.org/packages/Microsoft.AspNetCore.Identity.Service)

[Microsoft.AspNetCore.Identity.Service.EntityFrameworkCore](https://www.nuget.org/packages/Microsoft.AspNetCore.Identity.Service.EntityFrameworkCore/)

[Microsoft.AspNetCore.Identity.Specification.Tests](https://www.nuget.org/packages/Microsoft.AspNetCore.Identity.Specification.Tests/)

> OpenID Connect and OAuth 2.0 Framework for ASP.NET Core

[IdentityServer4](https://www.nuget.org/packages/IdentityServer4)

[IdentityServer4.AccessTokenValidation](https://www.nuget.org/packages/IdentityServer4.AccessTokenValidation/)

> Easy-to-use OpenID Connect server for ASP.NET Core

[OpenIddict](https://www.nuget.org/packages/OpenIddict/)

[OpenIddict.Mvc](https://www.nuget.org/packages/OpenIddict.Mvc/)

[OpenIddict.EntityFrameworkCore](https://www.nuget.org/packages/OpenIddict.EntityFrameworkCore/)

---
## Email

> MailKit is an Open Source cross-platform .NET mail-client library that is based on MimeKit and optimized for mobile devices.

[MailKit](https://www.nuget.org/packages/MailKit/)

> A .NET Fake SMTP Server

[netDumbster](https://www.nuget.org/packages/netDumbster)

---
## Language Integrated Query (LINQ)

> re-linq Frontend: A foundation for parsing LINQ expression trees and generating queries in SQL or other languages.

[Remotion.Linq](https://www.nuget.org/packages/Remotion.Linq/)


> LINQ to Regex library provides language integrated access to the .NET regular expressions.

[LinqToRegex](https://www.nuget.org/packages/LinqToRegex/)


> Dynamic LINQ lets you express queries as text.

[System.Linq.Dynamic.Core](https://www.nuget.org/packages/System.Linq.Dynamic.Core/)


> This project enhances LINQ to Objects with extra methods, in a manner which keeps to the spirit of LINQ.

[morelinq](https://www.nuget.org/packages/morelinq/)

> A collection of extension methods to IQueryable and IEnumerable that enable easy searching and ranking. Searches can be performed against multiple properties and support a wide range of types

[NinjaNye.SearchExtensions](https://www.nuget.org/packages/NinjaNye.SearchExtensions/)

> MathExtensions is a library for .NET that aims to extend the basic but yet incomplete System.Math, with simple and useful extensions methods regarding various mathematical domains, like methods for combinatorics, sequence analysis, generation and manipulation, random extractions, etc.

[TommasoScalici.MathExtensions](https://www.nuget.org/packages/TommasoScalici.MathExtensions/)

---
## AspNetCore

> A service API versioning library for Microsoft ASP.NET Core.

[Microsoft.AspNetCore.Mvc.Versioning](https://www.nuget.org/packages/Microsoft.AspNetCore.Mvc.Versioning/)

[Microsoft.AspNetCore.Mvc.Versioning.ApiExplorer](https://www.nuget.org/packages/Microsoft.AspNetCore.Mvc.Versioning.ApiExplorer/)

> The automatic type-safe REST library for Xamarin and .NET

[Refit](https://www.nuget.org/packages/Refit/)

> SignalR, Incredibly simple real-time web for ASP.NET Core

[Microsoft.AspNetCore.SignalR](https://www.nuget.org/packages/Microsoft.AspNetCore.SignalR)

[Microsoft.AspNetCore.SignalR.Core](https://www.nuget.org/packages/Microsoft.AspNetCore.SignalR.Core)

[Microsoft.AspNetCore.SignalR.Client](https://www.nuget.org/packages/Microsoft.AspNetCore.SignalR.Client)

[Microsoft.AspNetCore.SignalR.Redis](https://www.nuget.org/packages/Microsoft.AspNetCore.SignalR.Redis)

[signalr-client](https://www.npmjs.com/package/@aspnet/signalr-client)

> Free, open source and cross-platform framework for creating modular and extendable web applications based on ASP.NET Core.

[ExtCore.Infrastructure](https://www.nuget.org/packages/ExtCore.Infrastructure/)

[ExtCore.WebApplication](https://www.nuget.org/packages/ExtCore.WebApplication/)

[ExtCore.Data.EntityFramework](https://www.nuget.org/packages/ExtCore.Data.EntityFramework/)

[ExtCore.Data.EntityFramework.SqlServer](https://www.nuget.org/packages/ExtCore.Data.EntityFramework.SqlServer/)

[ExtCore.Data.EntityFramework.Sqlite](https://www.nuget.org/packages/ExtCore.Data.EntityFramework.Sqlite/)

[ExtCore.Data.EntityFramework.PostgreSql](https://www.nuget.org/packages/ExtCore.Data.EntityFramework.PostgreSql/)

> Nancy is a lightweight web framework for the .Net platform, inspired by Sinatra. Nancy aim at delivering a low ceremony approach to building light, fast web applications.

[Nancy](https://www.nuget.org/packages/Nancy/)

> Botwin is a library that allows Nancy-esque routing for use with ASP.NET Core.

[Botwin](https://www.nuget.org/packages/Botwin)

> AspNetCore.Health enables load balancers to monitor the status of deployed Web applications.

[AspNetCore.Health](https://www.nuget.org/packages/AspNetCore.Health)

> Warden is an open source library built to solve the problem of monitoring the resources.

[Warden](https://www.nuget.org/packages/Warden/)

[Warden.Watchers.Process](https://www.nuget.org/packages/Warden.Watchers.Process/)

[Warden.Watchers.Web](https://www.nuget.org/packages/Warden.Watchers.Web/)

[Warden.Integrations.HttpApi](https://www.nuget.org/packages/Warden.Integrations.HttpApi/)

[Warden.Watchers.Server](https://www.nuget.org/packages/Warden.Watchers.Server/)

[Warden.Watchers.MsSql](https://www.nuget.org/packages/Warden.Watchers.MsSql/)

[Warden.Integrations.MsSql](https://www.nuget.org/packages/Warden.Integrations.MsSql/)

[Warden.Watchers.Redis](https://www.nuget.org/packages/Warden.Watchers.Redis/)

[Warden.Watchers.MongoDb](https://www.nuget.org/packages/Warden.Watchers.MongoDb/)

[Warden.Watchers.Disk](https://www.nuget.org/packages/Warden.Watchers.Disk/)

> A lightweight ASP.Net Core library for runtime CSS and JavaScript file management, minification, combination & compression

[Smidge](https://www.nuget.org/packages/Smidge)

[Smidge.Nuglify](https://www.nuget.org/packages/Smidge.Nuglify)

> A runtime bundler and minifier for ASP.NET Core

[LigerShark.WebOptimizer.Core](https://www.nuget.org/packages/LigerShark.WebOptimizer.Core/)

> AspNetCoreRateLimit is an ASP.NET Core rate limiting solution designed to control the rate of requests that clients can make to a Web API or MVC app based on IP address or client ID. The AspNetCoreRateLimit package contains an IpRateLimitMiddleware and a ClientRateLimitMiddleware, with each middleware you can set multiple limits for different scenarios like allowing an IP or Client to make a maximum number of calls in a time interval like per second, 15 minutes, etc. You can define these limits to address all requests made to an API or you can scope the limits to each API URL or HTTP verb and path.

[AspNetCoreRateLimit](https://www.nuget.org/packages/AspNetCoreRateLimit/)

> R4MVC is a Roslyn code generator for ASP.NET Core MVC apps that creates strongly typed helpers that eliminate the use of literal strings in many places

[R4Mvc](https://www.nuget.org/packages/R4Mvc)

> ASP.NET Core client web browser detection extension to resolve devices, platforms, engine of the client.

[Wangkanai.Detection](https://www.nuget.org/packages/Wangkanai.Detection/2.0.0-beta8)

> Lightweight mini-profiler, designed for ASP.NET Core MVC (*not* System.Web) websites

[MiniProfiler.AspNetCore.Mvc](https://www.nuget.org/packages/MiniProfiler.AspNetCore.Mvc/)

> SaasKit is a .NET toolkit for building SaaS (Software As A Service) applications.
> The goal of the project is to help developers build SaaS products without getting in the way. It aims to be platform agnostic and as simple to use as possible.

[SaasKit.Multitenancy](https://www.nuget.org/packages/SaasKit.Multitenancy/)

> Sieve is a simple, clean, and extensible framework for .NET Core that adds sorting, filtering, and pagination functionality out of the box. Most common use case would be for serving ASP.NET Core GET queries. 

[Sieve](https://www.nuget.org/packages/Sieve)

> JSON Localization Resources

[My.Extensions.Localization.Json](https://www.nuget.org/packages/My.Extensions.Localization.Json)

---
## Swagger

> NSwag: The Swagger API toolchain for .NET and TypeScript

[NSwag.Core](https://www.nuget.org/packages/NSwag.Core/)

[NSwag.Annotations](https://www.nuget.org/packages/NSwag.Annotations/)

[NSwag.Commands](https://www.nuget.org/packages/NSwag.Commands/)

[NSwag.ConsoleCore](https://www.nuget.org/packages/NSwag.ConsoleCore/)

[NSwag.AssemblyLoaderCore](https://www.nuget.org/packages/NSwag.AssemblyLoaderCore/)

[NSwag.AspNetCore](https://www.nuget.org/packages/NSwag.AspNetCore/)

[NSwag.SwaggerGeneration](https://www.nuget.org/packages/NSwag.SwaggerGeneration/)

[NSwag.CodeGeneration](https://www.nuget.org/packages/NSwag.CodeGeneration/)

[NSwag.CodeGeneration.CSharp](https://www.nuget.org/packages/NSwag.CodeGeneration.CSharp/)

[NSwag.CodeGeneration.TypeScript](https://www.nuget.org/packages/NSwag.CodeGeneration.TypeScript/)

[NSwag.SwaggerGeneration.WebApi](https://www.nuget.org/packages/NSwag.SwaggerGeneration.WebApi/)

> Swagger tooling for API's built with ASP.NET Core. Generate beautiful API documentation, including a UI to explore and test operations, directly from your routes, controllers and models.

[Swashbuckle.AspNetCore](https://www.nuget.org/packages/Swashbuckle.AspNetCore/)

> .NET models with JSON and YAML writers for OpenAPI specification

[Microsoft.OpenApi](https://www.nuget.org/packages/Microsoft.OpenApi)

[Microsoft.OpenApi.Readers](https://www.nuget.org/packages/Microsoft.OpenApi.Readers/)

---
## Bot Engine

> Microsoft Bot Builder is a powerful framework for constructing bots that can handle both freeform interactions and more guided ones where the possibilities are explicitly shown to the user. It is easy to use and leverages C# to provide a natural way to write bots.

[Microsoft.Bot.Builder](https://www.nuget.org/packages/Microsoft.Bot.Builder/)

---
## Machine Learning 

> ML.NET is a cross-platform open-source machine learning framework which makes machine learning accessible to .NET developers.

[Microsoft.ML](https://www.nuget.org/packages/Microsoft.ML/)

> .NET Bindings for TensorFlow

[TensorFlowSharp](https://www.nuget.org/packages/TensorFlowSharp/)

---
## Miscellaneous

> Humanizer meets all your .NET needs for manipulating and displaying strings, enums, dates, times, timespans, numbers and quantities

[Humanizer](https://www.nuget.org/packages/Humanizer)

> (pronounced dyna-mighty) flexes DLR muscle to do meta-mazing things in .net

[Dynamitey](https://www.nuget.org/packages/Dynamitey/)

> Enums.NET is a high-performance type-safe .NET enum utility library

[Enums.NET](https://www.nuget.org/packages/Enums.NET/)

> A fluent, portable URL builder. To make HTTP calls off the fluent chain, check out Flurl.Http.

[Flurl](https://www.nuget.org/packages/Flurl/)

[Flurl.Http](https://www.nuget.org/packages/Flurl.Http/)

[Flurl.Http.Xml](https://www.nuget.org/packages/Flurl.Http.Xml/)

> Simple, reliable feature toggles in .NET

[FeatureToggle](https://www.nuget.org/packages/FeatureToggle/)

> A fast globbing library for .NET / .NETStandard applications. Outperforms Regex.

[DotNet.Glob](https://www.nuget.org/packages/DotNet.Glob/)

> UnitConversion is designed to be expansible through factories or through concrete converter implementations.

[UnitConversion](https://www.nuget.org/packages/UnitConversion)

> Provides easy-to-use and robust fully distributed locks (using SQLServer) as well as wrappers for named system-wide locks (using WaitHandles)

[DistributedLock](https://www.nuget.org/packages/DistributedLock)

> What you have been waiting for. Perform a deep compare of any two .NET objects using reflection. Shows the differences between the two objects.

[CompareNETObjects](https://www.nuget.org/packages/CompareNETObjects/)

> C# implementation of ua-parser

[UAParser](https://www.nuget.org/packages/UAParser/)

> A library implementing different string similarity and distance measures.

[StringSimilarity.NET](https://github.com/feature23/StringSimilarity.NET)

> Functional Extensions for C#

[CSharpFunctionalExtensions](https://github.com/vkhorikov/CSharpFunctionalExtensions)

> A powerful Dynamic Sql Query Builder supporting Sql Server, MySql, PostgreSql and Firebird

[SqlKata](https://www.nuget.org/packages/SqlKata)

> Tiny.RestClient facilitates the dialog between your API and your application. It hides all the complexity of communication, deserialisation ...

[Tiny.RestClient](https://www.nuget.org/packages/Tiny.RestClient/)

> An async-based GitHub API client library for .NET and .NET Core

[Octokit](https://www.nuget.org/packages/octokit)

> Crontab for .NET

[NCrontab](https://www.nuget.org/packages/ncrontab)

> Extensions to LINQ to Objects

[MoreLINQ](https://www.nuget.org/packages/morelinq/)

> Utility libraries to interact with discs, filesystem formats and more

[DiscUtils](https://www.nuget.org/packages/Discutils/0.14.2-alpha)

> The client API for Event Store. Get the open source or commercial versions of Event Store server from https://eventstore.org/

[EventStore.Client](https://www.nuget.org/packages/EventStore.Client/)

## Tools

> Request/response Inspector middleware for ASP.NET Core. like Glimpse.

[Rin](https://www.nuget.org/packages/Rin)

[MiniProfiler](https://www.nuget.org/packages/MiniProfiler/)

[ReferenceTrimmer](https://github.com/dfederm/ReferenceTrimmer)

---


