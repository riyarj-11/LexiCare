# Multi-stage build for ASP.NET Core 10 Web API
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project file and isolated nuget config for fast caching
COPY ["LexiCare.Server.csproj", "./"]
COPY ["nuget.config", "./"]
RUN dotnet restore "LexiCare.Server.csproj"

# Copy source and publish
COPY . .
RUN dotnet publish "LexiCare.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Environment configuration
ENV ASPNETCORE_URLS=http://+:5200
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 5200

ENTRYPOINT ["dotnet", "LexiCare.Server.dll"]
