# Multi-stage build for ASP.NET Core 10 Web API
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["LexiCare.Server.csproj", "./"]
COPY ["../nuget.config", "./nuget.config"]
RUN dotnet restore "LexiCare.Server.csproj"

COPY . .
RUN dotnet publish "LexiCare.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5200
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 5200

ENTRYPOINT ["dotnet", "LexiCare.Server.dll"]
