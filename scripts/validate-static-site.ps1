param(
    [string]$Root = "."
)

$ErrorActionPreference = "Stop"

$siteRoot = (Resolve-Path -LiteralPath $Root).Path
$chromeCandidates = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
)

function Add-Result {
    param(
        [System.Collections.Generic.List[object]]$Results,
        [string]$Name,
        [bool]$Passed,
        [string]$Detail
    )

    $Results.Add([pscustomobject]@{
        Name = $Name
        Passed = $Passed
        Detail = $Detail
    }) | Out-Null
}

function Test-CommandExists {
    param([string]$Name)
    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Get-ChromePath {
    foreach ($candidate in $chromeCandidates) {
        if (Test-Path -LiteralPath $candidate) {
            return $candidate
        }
    }
    return $null
}

function Get-DisplayPath {
    param(
        [string]$SiteRoot,
        [string]$Path
    )

    if ($Path.StartsWith($SiteRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        return $Path.Substring($SiteRoot.Length).TrimStart('\', '/')
    }

    return $Path
}

function Test-JavaScriptSyntax {
    param(
        [string]$SiteRoot,
        [string]$RelativePath
    )

    $scriptPath = Join-Path $SiteRoot $RelativePath
    if (-not (Test-Path -LiteralPath $scriptPath)) {
        return @{
            Passed = $false
            Detail = "Missing file: $RelativePath"
        }
    }

    $output = & node --check $scriptPath 2>&1
    if ($LASTEXITCODE -eq 0) {
        return @{
            Passed = $true
            Detail = $RelativePath
        }
    }

    return @{
        Passed = $false
        Detail = ($output | Out-String).Trim()
    }
}

function Test-HeadlessMarkers {
    param(
        [string]$BrowserPath,
        [string]$PagePath,
        [string[]]$Markers
    )

    $fileUri = [System.Uri]::new($PagePath).AbsoluteUri
    $dom = (& $BrowserPath --headless=new --disable-gpu --allow-file-access-from-files --virtual-time-budget=6000 --dump-dom $fileUri 2>$null | Out-String)

    if ([string]::IsNullOrWhiteSpace($dom)) {
        return @{
            Passed = $false
            Detail = "Unable to inspect $PagePath in headless browser."
        }
    }

    $missing = @()
    foreach ($marker in $Markers) {
        if ($dom -notmatch [regex]::Escape($marker)) {
            $missing += $marker
        }
    }

    if ($missing.Count -gt 0) {
        return @{
            Passed = $false
            Detail = "Missing markers: $($missing -join ', ')"
        }
    }

    return @{
        Passed = $true
        Detail = Get-DisplayPath -SiteRoot $siteRoot -Path $PagePath
    }
}

$results = [System.Collections.Generic.List[object]]::new()

if (-not (Test-CommandExists "node")) {
    throw "Node.js is required for validation."
}

$browserPath = Get-ChromePath
if (-not $browserPath) {
    throw "Chrome or Edge was not found for headless validation."
}

$requiredFiles = @(
    "assets/js/nav-menu-fallback.js",
    "assets/js/forms-handler.js",
    "assets/search-index.js",
    "assets/search-index.json"
)

foreach ($relativePath in $requiredFiles) {
    $exists = Test-Path -LiteralPath (Join-Path $siteRoot $relativePath)
    Add-Result -Results $results -Name "File exists: $relativePath" -Passed $exists -Detail ($(if ($exists) { "OK" } else { "Missing" }))
}

$syntaxFiles = @(
    "assets/js/nav-menu-fallback.js",
    "assets/js/forms-handler.js",
    "assets/search-index.js"
)

foreach ($relativePath in $syntaxFiles) {
    $check = Test-JavaScriptSyntax -SiteRoot $siteRoot -RelativePath $relativePath
    Add-Result -Results $results -Name "Syntax: $relativePath" -Passed $check.Passed -Detail $check.Detail
}

$htmlChecks = @(
    @{
        Name = "Homepage Google tag top-of-head"
        Path = "index.html"
        Markers = @(
            "<head>",
            "<!-- Google tag (gtag.js) -->",
            "https://www.googletagmanager.com/gtag/js?id=G-6MH0FE7867",
            "gtag('config', 'G-6MH0FE7867');"
        )
    },
    @{
        Name = "Homepage asset refs"
        Path = "index.html"
        Markers = @("assets/js/nav-menu-fallback.js", "assets/js/forms-handler.js")
    },
    @{
        Name = "Contact asset refs"
        Path = "contact/index.html"
        Markers = @("../assets/js/nav-menu-fallback.js", "../assets/js/forms-handler.js")
    },
    @{
        Name = "Search page refs"
        Path = "search/index.html"
        Markers = @("../assets/search-index.js", "assets/search-index.json")
    }
)

foreach ($check in $htmlChecks) {
    $fullPath = Join-Path $siteRoot $check.Path
    $content = if (Test-Path -LiteralPath $fullPath) { Get-Content -LiteralPath $fullPath -Raw } else { "" }
    $missing = @()
    foreach ($marker in $check.Markers) {
        if ($content -notmatch [regex]::Escape($marker)) {
            $missing += $marker
        }
    }

    Add-Result -Results $results -Name $check.Name -Passed ($missing.Count -eq 0) -Detail ($(if ($missing.Count -eq 0) { $check.Path } else { "Missing markers: $($missing -join ', ')" }))
}

$browserChecks = @(
    @{
        Name = "Homepage runtime nav/search"
        Path = "index.html"
        Markers = @("static-nav-ready", "submenu-toggle", "static-header-search-btn", "static-modal-search-form")
    },
    @{
        Name = "Contact runtime nav/search"
        Path = "contact/index.html"
        Markers = @("static-nav-ready", "submenu-toggle", "static-header-search-btn", "static-modal-search-form")
    },
    @{
        Name = "Articles runtime nav/search"
        Path = "articles/index.html"
        Markers = @("static-nav-ready", "submenu-toggle", "static-header-search-btn", "static-modal-search-form")
    }
)

foreach ($check in $browserChecks) {
    $fullPath = Join-Path $siteRoot $check.Path
    if (-not (Test-Path -LiteralPath $fullPath)) {
        Add-Result -Results $results -Name $check.Name -Passed $false -Detail "Missing page: $($check.Path)"
        continue
    }

    $result = Test-HeadlessMarkers -BrowserPath $browserPath -PagePath $fullPath -Markers $check.Markers
    Add-Result -Results $results -Name $check.Name -Passed $result.Passed -Detail $result.Detail
}

$results | ForEach-Object {
    $status = if ($_.Passed) { "[PASS]" } else { "[FAIL]" }
    Write-Host "$status $($_.Name) - $($_.Detail)"
}

if ($results.Passed -contains $false) {
    exit 1
}

Write-Host ""
Write-Host "Static site validation passed."
