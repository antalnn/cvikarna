using Cvikarna.Api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Cvikarna.Api.Tests;

/// <summary>
/// One in-memory SQLite database per test class, with the real migrations and
/// the real seed files. The connection stays open for the lifetime of the
/// factory because an in-memory database disappears when its last connection
/// closes.
/// </summary>
public sealed class ApiFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection = new("Data Source=:memory:");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        _connection.Open();

        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<AppDbContext>();
            services.AddDbContext<AppDbContext>(options => options.UseSqlite(_connection));
        });
    }

    public override async ValueTask DisposeAsync()
    {
        await base.DisposeAsync();
        await _connection.DisposeAsync();
    }
}
