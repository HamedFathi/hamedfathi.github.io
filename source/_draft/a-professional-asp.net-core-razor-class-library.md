---
title: A Professional ASP.NET Core - Razor Class Library
date: December 17 2020
category: aspnetcore
tags:
    - dotnet
    - aspnetcore
    - rcl
    - razor
    - razorclasslibrary
---
 
Razor views, pages, controllers, page models, Razor components, View components, and data models can be built into a Razor class library (RCL). The RCL can be packaged and reused. Applications can include the RCL and override the views and pages it contains. When a view, partial view, or Razor Page is found in both the web app and the RCL, the Razor markup (.cshtml file) in the web app takes precedence.

<!-- more -->

## Create project

Choose `Razor Class Library`.

![](/images/a-professional-asp.net-core-razor-class-library/1.png)

Name it as `RazorSample`.

![](/images/a-professional-asp.net-core-razor-class-library/2.png)

Select `.NET 5.0`.

![](/images/a-professional-asp.net-core-razor-class-library/3.png)

You can see the RCL project structure.

![](/images/a-professional-asp.net-core-razor-class-library/4.png)

To test RCL create a `MVC Wep App`.

![](/images/a-professional-asp.net-core-razor-class-library/5.png)

Name it as `WebApplicationSample`.

![](/images/a-professional-asp.net-core-razor-class-library/6.png)

Select `.NET 5.0`.

![](/images/a-professional-asp.net-core-razor-class-library/7.png)

The final solution structure should like below.

![](/images/a-professional-asp.net-core-razor-class-library/8.png)

## Reference(s)

Most of the information in this article has gathered from various references.

* https://docs.microsoft.com/en-us/aspnet/core/razor-pages/ui-class
* https://www.c-sharpcorner.com/article/create-reusable-view-using-razor-class-library-in-asp-net-core/
* http://www.binaryintellect.net/articles/90d7323f-dcde-40d4-aa30-987bc8db1bf4.aspx