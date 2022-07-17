---
title: A Professional ASP.NET Core - File Upload
date: October 12 2020
category: aspnetcore
tags:
    - dotnet
    - aspnetcore
    - file
    - upload
---

ASP.NET Core supports uploading one or more files using buffered model binding for smaller files and unbuffered streaming for larger files.

<!-- more -->

![](/images/a-professional-asp.net-core-file-upload/vs.png)

## File Model

Create a new class, `Models/FileModel.cs`. This will be the base class.

```cs
public abstract class FileModel
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string FileType { get; set; }
    public string Extension { get; set; }
    public string Description { get; set; }
    public string UploadedBy { get; set; }
    public DateTime? CreatedOn { get; set; }
}
```

Now, let's create a model for the file on the file system. Name it `Models/FileOnFileSystem.cs` and inherit the `FileModel` class.

```cs
public class FileOnFileSystemModel : FileModel
{
    public string FilePath { get; set; }
}
```

Similarly add another class for the file on database, `Models/FileOnDatabaseModel.cs`

```cs
public class FileOnDatabaseModel : FileModel
{
    public byte[] Data { get; set; }
}
```

## Setting up Entity Framework Core

Install the below packages

```bash
Install-Package Microsoft.EntityFrameworkCore -Version 3.1.9
dotnet add package Microsoft.EntityFrameworkCore --version 3.1.9
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="3.1.9" />

Install-Package Microsoft.EntityFrameworkCore.Design -Version 3.1.9
dotnet add package Microsoft.EntityFrameworkCore.Design --version 3.1.9
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="3.1.9">
  <PrivateAssets>all</PrivateAssets>
  <IncludeAssets>runtime; build; native; contentfiles; analyzers</IncludeAssets>
</PackageReference>

Install-Package Microsoft.EntityFrameworkCore.Tools -Version 3.1.9
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 3.1.9
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="3.1.9">
  <PrivateAssets>all</PrivateAssets>
  <IncludeAssets>runtime; build; native; contentfiles; analyzers</IncludeAssets>
</PackageReference>

Install-Package Microsoft.EntityFrameworkCore.SqlServer -Version 3.1.9
dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 3.1.9
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="3.1.9" />
```

Next, add a connection string to your `appsetting.json` file.

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=.;Database=FileDb;Trusted_Connection=True;"
}
```

Create `ApplicationDbContext`

```cs
using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    { }
    public DbSet<FileOnDatabaseModel> FilesOnDatabase { get; set; }
    public DbSet<FileOnFileSystemModel> FilesOnFileSystem { get; set; }
}
```

Let's now configure the services. Modify the `Startup.cs/ConfigureServices`.

```cs
using Microsoft.EntityFrameworkCore;

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // ...
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
            Configuration.GetConnectionString("DefaultConnection"),
            b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName))
        );
        // ...
    }
}
```

Finally, let's do the required migrations and update our database. Just run the following commands on the `Package Manager Console` or other terminals.

```bash
Add-Migration initial
Update-Database

// dotnet tool install --global dotnet-ef
// dotnet tool update --global dotnet-ef
dotnet ef migrations add initial
dotnet ef database update
```

You will get a done message on console. Open up SQL Server Object Explorer to check if the database and tables have been created.

![](/images/a-professional-asp.net-core-file-upload/db.png)

## Setting up the View and ViewModel

Make a new class, a ViewModel class, `Models/FileUploadViewModel.cs` as below.

```cs
public class FileUploadViewModel
{
    public List<FileOnFileSystemModel> FilesOnFileSystem { get; set; }
    public List<FileOnDatabaseModel> FilesOnDatabase { get; set; }
}
```
![](/images/a-professional-asp.net-core-file-upload/upload.png)

After that, Let's start modifying the View Page, `Views/File/Index.cshtml`.

```html
@model FileUploadViewModel
@{
    ViewData["Title"] = "Index";
    Layout = "~/Views/Shared/_Layout.cshtml";
}

<h4>Start Uploading Files Here</h4>
<hr />
@if (ViewBag.Message != null)
{
    <div class="alert alert-success alert-dismissible" style="margin-top:20px">
        @ViewBag.Message
    </div>
}
<form method="post" enctype="multipart/form-data">
    <input type="file" name="files" multiple required />
    <input type="text" autocomplete="off" placeholder="Enter File Description" name="description" required />
    <button type="submit" class="btn btn-primary" asp-controller="File" asp-action="UploadToFileSystem">Upload to File System</button>
    <button class="btn btn-success" type="submit" asp-controller="File" asp-action="UploadToDatabase">Upload to Database</button>
</form>
<hr />
<h4>Files on File System</h4>
@if (Model.FilesOnFileSystem.Count == 0)
{
    <caption>No Records Found</caption>
}
else
{
    <caption>List of Files on File System</caption>
    <table class="table table-striped">
        <thead>
            <tr>
                <th>#</th>
                <th>Name</th>
                <th>Description</th>
                <th>File Type</th>
                <th>Created On</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach (var file in Model.FilesOnFileSystem)
            {
                <tr>
                    <th>@file.Id</th>
                    <td>@file.Name</td>
                    <td>@file.Description</td>
                    <td>@file.FileType</td>
                    <td>@file.CreatedOn</td>
                    <td>
                        <a type="button" class="btn btn-primary" asp-controller="File" asp-action="DownloadFileFromFileSystem" asp-route-id="@file.Id">Download</a>
                        <a type="button" class="btn btn-danger" asp-controller="File" asp-action="DeleteFileFromFileSystem" asp-route-id="@file.Id">Delete</a>
                    </td>
                </tr>
            }
        </tbody>
    </table>
}
<hr />
<h4>Files on Database</h4>
@if (Model.FilesOnDatabase.Count == 0)
{
    <caption>No Records Found</caption>
}
else
{
    <caption>List of Files on Database</caption>
    <table class="table table-striped">
        <thead>
            <tr>
                <th>#</th>
                <th>Name</th>
                <th>Description</th>
                <th>File Type</th>
                <th>Created On</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach (var file in Model.FilesOnDatabase)
            {
                <tr>
                    <th>@file.Id</th>
                    <td>@file.Name</td>
                    <td>@file.Description</td>
                    <td>@file.FileType</td>
                    <td>@file.CreatedOn</td>
                    <td>
                        <a type="button" class="btn btn-primary" asp-controller="File" asp-action="DownloadFileFromDatabase" asp-route-id="@file.Id">Download</a>
                        <a type="button" class="btn btn-danger" asp-controller="File" asp-action="DeleteFileFromDatabase" asp-route-id="@file.Id">Delete</a>
                    </td>
                </tr>
            }
        </tbody>
    </table>
}
```

Now, Create `FileController`

```cs
// Controllers/FileController.cs

public class FileController : Controller
{
    private readonly ApplicationDbContext context;
    public FileController(ApplicationDbContext context)
    {
        this.context = context;
    }
    public async Task<IActionResult> Index()
    {
        var fileuploadViewModel = await LoadAllFiles();
        ViewBag.Message = TempData["Message"];
        return View(fileuploadViewModel);
    }
    [HttpPost]
    public async Task<IActionResult> UploadToFileSystem(List<IFormFile> files, string description)
    {
        foreach (var file in files)
        {
            var basePath = Path.Combine(Directory.GetCurrentDirectory() + "\\Files\\");
            bool basePathExists = System.IO.Directory.Exists(basePath);
            if (!basePathExists) Directory.CreateDirectory(basePath);
            var fileName = Path.GetFileNameWithoutExtension(file.FileName);
            var filePath = Path.Combine(basePath, file.FileName);
            var extension = Path.GetExtension(file.FileName);
            if (!System.IO.File.Exists(filePath))
            {
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                var fileModel = new FileOnFileSystemModel
                {
                    CreatedOn = DateTime.UtcNow,
                    FileType = file.ContentType,
                    Extension = extension,
                    Name = fileName,
                    Description = description,
                    FilePath = filePath
                };
                await context.FilesOnFileSystem.AddAsync(fileModel);
                await context.SaveChangesAsync();
            }
        }
        TempData["Message"] = "File successfully uploaded to File System.";
        return RedirectToAction("Index");
    }
    [HttpPost]
    public async Task<IActionResult> UploadToDatabase(List<IFormFile> files, string description)
    {
        foreach (var file in files)
        {
            var fileName = Path.GetFileNameWithoutExtension(file.FileName);
            var extension = Path.GetExtension(file.FileName);
            var fileModel = new FileOnDatabaseModel
            {
                CreatedOn = DateTime.UtcNow,
                FileType = file.ContentType,
                Extension = extension,
                Name = fileName,
                Description = description
            };
            using (var dataStream = new MemoryStream())
            {
                await file.CopyToAsync(dataStream);
                fileModel.Data = dataStream.ToArray();
            }
            await context.FilesOnDatabase.AddAsync(fileModel);
            await context.SaveChangesAsync();
        }
        TempData["Message"] = "File successfully uploaded to Database";
        return RedirectToAction("Index");
    }
    private async Task<FileUploadViewModel> LoadAllFiles()
    {
        var viewModel = new FileUploadViewModel();
        viewModel.FilesOnDatabase = await context.FilesOnDatabase.ToListAsync();
        viewModel.FilesOnFileSystem = await context.FilesOnFileSystem.ToListAsync();
        return viewModel;
    }
    public async Task<IActionResult> DownloadFileFromDatabase(int id)
    {
        var file = await context.FilesOnDatabase.Where(x => x.Id == id).FirstOrDefaultAsync();
        if (file == null) return null;
        return File(file.Data, file.FileType, file.Name + file.Extension);
    }
    public async Task<IActionResult> DownloadFileFromFileSystem(int id)
    {
        var file = await context.FilesOnFileSystem.Where(x => x.Id == id).FirstOrDefaultAsync();
        if (file == null) return null;
        var memory = new MemoryStream();
        using (var stream = new FileStream(file.FilePath, FileMode.Open))
        {
            await stream.CopyToAsync(memory);
        }
        memory.Position = 0;
        return File(memory, file.FileType, file.Name + file.Extension);
    }
    public async Task<IActionResult> DeleteFileFromFileSystem(int id)
    {
        var file = await context.FilesOnFileSystem.Where(x => x.Id == id).FirstOrDefaultAsync();
        if (file == null) return null;
        if (System.IO.File.Exists(file.FilePath))
        {
            System.IO.File.Delete(file.FilePath);
        }
        context.FilesOnFileSystem.Remove(file);
        await context.SaveChangesAsync();
        TempData["Message"] = $"Removed {file.Name + file.Extension} successfully from File System.";
        return RedirectToAction("Index");
    }
    public async Task<IActionResult> DeleteFileFromDatabase(int id)
    {
        var file = await context.FilesOnDatabase.Where(x => x.Id == id).FirstOrDefaultAsync();
        context.FilesOnDatabase.Remove(file);
        await context.SaveChangesAsync();
        TempData["Message"] = $"Removed {file.Name + file.Extension} successfully from Database.";
        return RedirectToAction("Index");
    }
}
```

![](/images/a-professional-asp.net-core-file-upload/final.png)

## Reference(s)

Most of the information in this article has gathered from various references.

* https://code-maze.com/file-upload-aspnetcore-mvc/
* https://khalidabuhakmeh.com/upload-a-file-using-aspdotnet-core
* https://www.c-sharpcorner.com/article/upload-download-files-in-asp-net-core-2-0
* https://gunnarpeipman.com/aspnet-core-file-uploads/
* https://www.codewithmukesh.com/blog/file-upload-in-aspnet-core-mvc/