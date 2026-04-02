param(
    [string]$Root = "."
)

$ErrorActionPreference = "Stop"

$siteRoot = (Resolve-Path -LiteralPath $Root).Path
$htmlFiles = Get-ChildItem -LiteralPath $siteRoot -Recurse -Filter "index.html" -File
$cssFiles = Get-ChildItem -LiteralPath $siteRoot -Recurse -Filter "*.css" -File

$unusedPaths = @(
    "wp-content/plugins/admin-menu-editor-pro",
    "wp-content/plugins/admin-security-optimization-suite-pro",
    "wp-content/plugins/all-in-one-wp-migration",
    "wp-content/plugins/all-in-one-wp-migration-gdrive-extension",
    "wp-content/plugins/code-snippets",
    "wp-content/plugins/fluent-smtp",
    "wp-content/plugins/litespeed-cache",
    "wp-content/plugins/seo-by-rank-math",
    "wp-content/plugins/simply-static",
    "wp-content/plugins/simply-static-pro",
    "wp-content/plugins/worker",
    "wp-content/plugins/wp-reviews-plugin-for-google",
    "wp-content/uploads/template-kits",
    "wp-content/uploads/2024",
    "wp-content/uploads/2026",
    "wp-content/uploads/uploads.zip"
)

$formsScriptPath = "/assets/js/forms-handler.js"
$navMenuScriptPath = "/assets/js/nav-menu-fallback.js"
$galleryScriptPath = "/assets/js/gallery-fallback.js"
$servicePagesCssPath = "/assets/css/service-pages-fallback.css"
$heroEnhancementsCssPath = "/assets/css/hero-background-enhancements.css"
$archiveCardsCssPath = "/assets/css/archive-cards-fallback.css"
$formsScriptTagPattern = '<script src="[^"]*assets/js/forms-handler\.js" defer></script>\s*'
$navMenuScriptTagPattern = '<script src="[^"]*assets/js/nav-menu-fallback\.js" defer></script>\s*'
$galleryScriptTagPattern = '<script src="[^"]*assets/js/gallery-fallback\.js" defer></script>\s*'
$servicePagesCssTagPattern = '<link rel="stylesheet" href="[^"]*assets/css/service-pages-fallback\.css">\s*'
$heroEnhancementsCssTagPattern = '<link rel="stylesheet" href="[^"]*assets/css/hero-background-enhancements\.css">\s*'
$archiveCardsCssTagPattern = '<link rel="stylesheet" href="[^"]*assets/css/archive-cards-fallback\.css">\s*'
$recaptchaScriptPattern = '<script src="https://www\.google\.com/recaptcha/api\.js\?render=explicit&amp;ver=[^"]+" id="elementor-recaptcha_v3-api-js"></script>'
$oembedLinePattern = '(?m)^.*oEmbed.*\r?\n?'
$jsonAltPattern = '<link rel="alternate" title="JSON" type="application/json" href="/wp-json/[^"]+">'
$apiWordpressPattern = '<link rel="https://api\.w\.org/" href="/wp-json/">'
$tiMetaPattern = '<meta name="ti-site-data" content="[^"]*">'
$cloudflareChallengePattern = '<script>\(function\(\)\{function c\(\)\{var b=a\.contentDocument\|\|a\.contentWindow\.document;.*?</script>'
$cloudflareEmailDecodePattern = '<script data-cfasync="false" src="/cdn-cgi/scripts/[^"]+/cloudflare-static/email-decode\.min\.js"></script>'
$siteUrlPrefixes = @(
    "https://grandwestvet.com",
    "http://grandwestvet.com",
    "https://www.grandwestvet.com",
    "http://www.grandwestvet.com"
)

function Get-DirectoryUri([string]$Path) {
    $resolved = (Resolve-Path -LiteralPath $Path).Path
    if (-not $resolved.EndsWith([IO.Path]::DirectorySeparatorChar)) {
        $resolved += [IO.Path]::DirectorySeparatorChar
    }

    return [System.Uri]$resolved
}

function Normalize-LocalSiteUrl([string]$Url) {
    if ([string]::IsNullOrWhiteSpace($Url)) {
        return $Url
    }

    foreach ($prefix in $siteUrlPrefixes) {
        if ($Url.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
            $trimmed = $Url.Substring($prefix.Length)
            if ([string]::IsNullOrEmpty($trimmed)) {
                return "/"
            }

            if ($trimmed.StartsWith("/")) {
                return $trimmed
            }

            return "/" + $trimmed
        }
    }

    return $Url
}

function Strip-LocalSiteDomain([string]$Content) {
    $updated = $Content

    foreach ($prefix in $siteUrlPrefixes) {
        $updated = $updated -replace [regex]::Escape($prefix), ""
    }

    return $updated
}

function Convert-RootRelativeUrl([string]$Url, [System.Uri]$CurrentDirectoryUri, [System.Uri]$SiteRootUri) {
    $Url = Normalize-LocalSiteUrl -Url $Url

    if ([string]::IsNullOrWhiteSpace($Url) -or -not $Url.StartsWith("/")) {
        return $Url
    }

    if ($Url.StartsWith("//") -or $Url.StartsWith("/cdn-cgi/") -or $Url.StartsWith("/api/")) {
        return $Url
    }

    $pathPart = $Url
    $suffix = ""
    $queryIndex = $Url.IndexOfAny([char[]]@("?", "#"))

    if ($queryIndex -ge 0) {
        $pathPart = $Url.Substring(0, $queryIndex)
        $suffix = $Url.Substring($queryIndex)
    }

    $relativeTarget = if ($pathPart -eq "/") { "" } else { $pathPart.TrimStart("/") }
    if ($pathPart.EndsWith("/") -and $relativeTarget -and -not $relativeTarget.EndsWith("/")) {
        $relativeTarget += "/"
    }

    $targetUri = [System.Uri]::new($SiteRootUri, $relativeTarget)
    $relativeUrl = [System.Uri]::UnescapeDataString($CurrentDirectoryUri.MakeRelativeUri($targetUri).ToString())

    if ([string]::IsNullOrEmpty($relativeUrl)) {
        $relativeUrl = "./"
    }

    if ($pathPart.EndsWith("/") -and -not $relativeUrl.EndsWith("/")) {
        $relativeUrl += "/"
    }

    return $relativeUrl + $suffix
}

function Convert-SrcSetValue([string]$Value, [System.Uri]$CurrentDirectoryUri, [System.Uri]$SiteRootUri) {
    $candidates = $Value -split ","
    $rewritten = foreach ($candidate in $candidates) {
        $trimmed = $candidate.Trim()
        if (-not $trimmed) { continue }

        $parts = $trimmed -split "\s+", 2
        $url = Convert-RootRelativeUrl -Url $parts[0] -CurrentDirectoryUri $CurrentDirectoryUri -SiteRootUri $SiteRootUri

        if ($parts.Count -gt 1) {
            "$url $($parts[1])"
        } else {
            $url
        }
    }

    return ($rewritten -join ", ")
}

function Resolve-LocalAssetPath([string]$Url, [string]$CurrentDirectoryPath, [string]$SiteRootPath) {
    $Url = Normalize-LocalSiteUrl -Url $Url

    if ([string]::IsNullOrWhiteSpace($Url)) {
        return $null
    }

    if (
        $Url.StartsWith("data:") -or
        $Url.StartsWith("//") -or
        $Url -match '^[a-zA-Z][a-zA-Z0-9+\-.]*:'
    ) {
        return $null
    }

    $pathPart = $Url
    $queryIndex = $Url.IndexOfAny([char[]]@("?", "#"))
    if ($queryIndex -ge 0) {
        $pathPart = $Url.Substring(0, $queryIndex)
    }

    if ([string]::IsNullOrWhiteSpace($pathPart)) {
        return $null
    }

    $candidatePath = if ($pathPart.StartsWith("/")) {
        $relativeTarget = $pathPart.TrimStart("/").Replace("/", [IO.Path]::DirectorySeparatorChar)
        if ($relativeTarget) {
            Join-Path $SiteRootPath $relativeTarget
        } else {
            $SiteRootPath
        }
    } else {
        $relativeTarget = $pathPart.Replace("/", [IO.Path]::DirectorySeparatorChar)
        if ($relativeTarget) {
            Join-Path $CurrentDirectoryPath $relativeTarget
        } else {
            $CurrentDirectoryPath
        }
    }

    if (Test-Path -LiteralPath $candidatePath -PathType Leaf) {
        return (Resolve-Path -LiteralPath $candidatePath).Path
    }

    return $null
}

function Get-DataUriMimeType([string]$Path) {
    switch ([IO.Path]::GetExtension($Path).ToLowerInvariant()) {
        ".webp" { return "image/webp" }
        ".png" { return "image/png" }
        ".jpg" { return "image/jpeg" }
        ".jpeg" { return "image/jpeg" }
        ".svg" { return "image/svg+xml" }
        default { return $null }
    }
}

function Convert-MaskUrlsToDataUris([string]$Content, [string]$CurrentDirectoryPath, [string]$SiteRootPath) {
    return [regex]::Replace(
        $Content,
        '(?<property>-webkit-mask-image|mask-image)\s*:\s*url\((?<url>[^)]+)\)',
        {
            param($match)

            $rawUrl = $match.Groups["url"].Value.Trim()
            if (
                ($rawUrl.StartsWith('"') -and $rawUrl.EndsWith('"')) -or
                ($rawUrl.StartsWith("'") -and $rawUrl.EndsWith("'"))
            ) {
                $rawUrl = $rawUrl.Substring(1, $rawUrl.Length - 2)
            }

            $assetPath = Resolve-LocalAssetPath -Url $rawUrl -CurrentDirectoryPath $CurrentDirectoryPath -SiteRootPath $SiteRootPath
            if (-not $assetPath) {
                return $match.Value
            }

            $mimeType = Get-DataUriMimeType -Path $assetPath
            if (-not $mimeType) {
                return $match.Value
            }

            $base64 = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($assetPath))
            return $match.Groups["property"].Value + ':url("data:' + $mimeType + ';base64,' + $base64 + '")'
        }
    )
}

function Convert-LocalPageHref(
    [string]$Url,
    [string]$CurrentDirectoryPath,
    [string]$SiteRootPath,
    [System.Uri]$CurrentDirectoryUri,
    [System.Uri]$SiteRootUri
) {
    $Url = Normalize-LocalSiteUrl -Url $Url

    if ([string]::IsNullOrWhiteSpace($Url)) {
        return $Url
    }

    if (
        $Url.StartsWith("#") -or
        $Url.StartsWith("mailto:") -or
        $Url.StartsWith("tel:") -or
        $Url.StartsWith("javascript:") -or
        $Url.StartsWith("data:") -or
        $Url.StartsWith("//") -or
        $Url -match '^[a-zA-Z][a-zA-Z0-9+\-.]*:'
    ) {
        return $Url
    }

    $pathPart = $Url
    $suffix = ""
    $queryIndex = $Url.IndexOfAny([char[]]@("?", "#"))

    if ($queryIndex -ge 0) {
        $pathPart = $Url.Substring(0, $queryIndex)
        $suffix = $Url.Substring($queryIndex)
    }

    if ([string]::IsNullOrWhiteSpace($pathPart)) {
        return $Url
    }

    $candidatePath = if ($pathPart.StartsWith("/")) {
        $relativeTarget = $pathPart.TrimStart("/").Replace("/", [IO.Path]::DirectorySeparatorChar)
        if ($relativeTarget) {
            Join-Path $SiteRootPath $relativeTarget
        } else {
            $SiteRootPath
        }
    } else {
        $relativeTarget = $pathPart.Replace("/", [IO.Path]::DirectorySeparatorChar)
        if ($relativeTarget) {
            Join-Path $CurrentDirectoryPath $relativeTarget
        } else {
            $CurrentDirectoryPath
        }
    }

    if (-not (Test-Path -LiteralPath $candidatePath -PathType Container)) {
        return $Url
    }

    $indexPath = Join-Path $candidatePath "index.html"
    if (-not (Test-Path -LiteralPath $indexPath -PathType Leaf)) {
        return $Url
    }

    $targetUri = [System.Uri]$indexPath
    $relativeUrl = [System.Uri]::UnescapeDataString($CurrentDirectoryUri.MakeRelativeUri($targetUri).ToString())

    if ([string]::IsNullOrEmpty($relativeUrl)) {
        $relativeUrl = "index.html"
    }

    return $relativeUrl + $suffix
}

function Remove-ElementorInvisibleClass([string]$Content) {
    $updated = $Content -replace '\belementor-invisible\b', ''

    return [regex]::Replace(
        $updated,
        'class=(["''])(?<classes>[^"'']*)\1',
        {
            param($match)

            $classes = $match.Groups["classes"].Value -split '\s+' | Where-Object { $_ }
            return "class=" + $match.Groups[1].Value + ($classes -join " ") + $match.Groups[1].Value
        }
    )
}

function Decode-CloudflareEmail([string]$Hex) {
    if ([string]::IsNullOrWhiteSpace($Hex) -or $Hex.Length -lt 2) {
        return ""
    }

    $key = [Convert]::ToInt32($Hex.Substring(0, 2), 16)
    $builder = [System.Text.StringBuilder]::new()

    for ($index = 2; $index -lt $Hex.Length; $index += 2) {
        $value = [Convert]::ToInt32($Hex.Substring($index, 2), 16) -bxor $key
        [void]$builder.Append([char]$value)
    }

    return $builder.ToString()
}

function Remove-TagAttribute([string]$Attributes, [string]$AttributeName) {
    return [regex]::Replace($Attributes, '\s+' + [regex]::Escape($AttributeName) + '=(["'']).*?\1', '')
}

function Remove-ClassToken([string]$Attributes, [string]$Token) {
    return [regex]::Replace(
        $Attributes,
        '\sclass=(["''])(?<classes>[^"'']*)\1',
        {
            param($match)

            $classes = $match.Groups["classes"].Value -split '\s+' | Where-Object { $_ -and $_ -ne $Token }
            if ($classes.Count -eq 0) {
                return ""
            }

            return ' class=' + $match.Groups[1].Value + ($classes -join " ") + $match.Groups[1].Value
        }
    )
}

function Decode-CloudflareEmailsInHtml([string]$Content) {
    $updated = [regex]::Replace(
        $Content,
        '<span(?<attributes>[^>]*?)class=["'']__cf_email__["''](?<rest>[^>]*?)data-cfemail=["''](?<hex>[0-9a-fA-F]+)["''](?<tail>[^>]*)>[\s\S]*?</span>',
        {
            param($match)

            $email = Decode-CloudflareEmail -Hex $match.Groups["hex"].Value
            return [System.Net.WebUtility]::HtmlEncode($email)
        }
    )

    $updated = [regex]::Replace(
        $updated,
        '<a(?<attributes>[^>]*?)href=["'']/cdn-cgi/l/email-protection["''](?<rest>[^>]*?)data-cfemail=["''](?<hex>[0-9a-fA-F]+)["''](?<tail>[^>]*)>[\s\S]*?</a>',
        {
            param($match)

            $email = Decode-CloudflareEmail -Hex $match.Groups["hex"].Value
            $attributes = $match.Groups["attributes"].Value + $match.Groups["rest"].Value + $match.Groups["tail"].Value
            $attributes = Remove-TagAttribute -Attributes $attributes -AttributeName "data-cfemail"
            $attributes = Remove-ClassToken -Attributes $attributes -Token "__cf_email__"

            return '<a' + $attributes + ' href="mailto:' + $email + '">' + [System.Net.WebUtility]::HtmlEncode($email) + '</a>'
        }
    )

    $updated = [regex]::Replace(
        $updated,
        '<a\b(?<before>[^>]*?)href=["'']/cdn-cgi/l/email-protection#(?<hex>[0-9a-fA-F]+)["''](?<after>[^>]*>)',
        {
            param($match)

            $email = Decode-CloudflareEmail -Hex $match.Groups["hex"].Value
            return '<a' + $match.Groups["before"].Value + 'href="mailto:' + $email + '"' + $match.Groups["after"].Value
        }
    )

    return $updated
}

function Convert-LocalUrlsInText([string]$Content, [System.Uri]$CurrentDirectoryUri, [System.Uri]$SiteRootUri) {
    $updated = [regex]::Replace(
        $Content,
        '(?<prefix>\b(?:href|src|action|poster|data-thumbnail)=["''])(?<url>/[^"'']*)(?<suffix>["''])',
        {
            param($match)
            $url = Convert-RootRelativeUrl -Url $match.Groups["url"].Value -CurrentDirectoryUri $CurrentDirectoryUri -SiteRootUri $SiteRootUri
            return $match.Groups["prefix"].Value + $url + $match.Groups["suffix"].Value
        }
    )

    $updated = [regex]::Replace(
        $updated,
        '(?<prefix>\bsrcset=["''])(?<value>[^"'']*)(?<suffix>["''])',
        {
            param($match)
            $value = Convert-SrcSetValue -Value $match.Groups["value"].Value -CurrentDirectoryUri $CurrentDirectoryUri -SiteRootUri $SiteRootUri
            return $match.Groups["prefix"].Value + $value + $match.Groups["suffix"].Value
        }
    )

    $updated = [regex]::Replace(
        $updated,
        'url\((?<quote>["'']?)(?<url>/[^)"'']+)(?<suffix>["'']?)\)',
        {
            param($match)
            $url = Convert-RootRelativeUrl -Url $match.Groups["url"].Value -CurrentDirectoryUri $CurrentDirectoryUri -SiteRootUri $SiteRootUri
            return "url(" + $match.Groups["quote"].Value + $url + $match.Groups["suffix"].Value + ")"
        }
    )

    return $updated
}

function Inline-ElementorGalleryThumbnails([string]$Content) {
    return [regex]::Replace(
        $Content,
        '<div(?<before>[^>]*class=["''][^"'']*elementor-gallery-item__image[^"'']*["''][^>]*?)data-thumbnail=["''](?<thumbnail>[^"'']+)["''](?<after>[^>]*)>',
        {
            param($match)

            $fullTag = $match.Value
            if ($fullTag -match 'style=["''][^"'']*background-image\s*:') {
                return $fullTag
            }

            $thumbnail = $match.Groups["thumbnail"].Value
            $styleValue = "background-image:url('" + $thumbnail + "');background-size:cover;background-position:center;background-repeat:no-repeat;"

            return '<div' + $match.Groups["before"].Value + 'data-thumbnail="' + $thumbnail + '" style="' + $styleValue + '"' + $match.Groups["after"].Value + '>'
        }
    )
}

function Build-DeferredScriptTag([string]$ScriptPath, [System.Uri]$CurrentDirectoryUri, [System.Uri]$SiteRootUri) {
    $resolvedPath = Convert-RootRelativeUrl -Url $ScriptPath -CurrentDirectoryUri $CurrentDirectoryUri -SiteRootUri $SiteRootUri
    return '<script src="' + $resolvedPath + '" defer></script>'
}

function Build-StylesheetTag([string]$StylesheetPath, [System.Uri]$CurrentDirectoryUri, [System.Uri]$SiteRootUri) {
    $resolvedPath = Convert-RootRelativeUrl -Url $StylesheetPath -CurrentDirectoryUri $CurrentDirectoryUri -SiteRootUri $SiteRootUri
    return '<link rel="stylesheet" href="' + $resolvedPath + '">'
}

$siteRootUri = Get-DirectoryUri -Path $siteRoot

foreach ($file in $htmlFiles) {
    $content = Get-Content -LiteralPath $file.FullName -Raw
    $updated = Strip-LocalSiteDomain -Content $content
    $currentDirectoryUri = Get-DirectoryUri -Path $file.DirectoryName
    $currentDirectoryPath = (Resolve-Path -LiteralPath $file.DirectoryName).Path
    $formsScriptTag = Build-DeferredScriptTag -ScriptPath $formsScriptPath -CurrentDirectoryUri $currentDirectoryUri -SiteRootUri $siteRootUri
    $navMenuScriptTag = Build-DeferredScriptTag -ScriptPath $navMenuScriptPath -CurrentDirectoryUri $currentDirectoryUri -SiteRootUri $siteRootUri
    $galleryScriptTag = Build-DeferredScriptTag -ScriptPath $galleryScriptPath -CurrentDirectoryUri $currentDirectoryUri -SiteRootUri $siteRootUri
    $servicePagesCssTag = Build-StylesheetTag -StylesheetPath $servicePagesCssPath -CurrentDirectoryUri $currentDirectoryUri -SiteRootUri $siteRootUri
    $heroEnhancementsCssTag = Build-StylesheetTag -StylesheetPath $heroEnhancementsCssPath -CurrentDirectoryUri $currentDirectoryUri -SiteRootUri $siteRootUri
    $archiveCardsCssTag = Build-StylesheetTag -StylesheetPath $archiveCardsCssPath -CurrentDirectoryUri $currentDirectoryUri -SiteRootUri $siteRootUri

    $updated = [regex]::Replace($updated, $recaptchaScriptPattern, "")
    $updated = [regex]::Replace($updated, $oembedLinePattern, "")
    $updated = [regex]::Replace($updated, $jsonAltPattern, "")
    $updated = [regex]::Replace($updated, $apiWordpressPattern, "")
    $updated = [regex]::Replace($updated, $tiMetaPattern, "")
    $updated = [regex]::Replace($updated, $cloudflareChallengePattern, "", [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $updated = [regex]::Replace($updated, $cloudflareEmailDecodePattern, "")
    $updated = [regex]::Replace($updated, $formsScriptTagPattern, "")
    $updated = [regex]::Replace($updated, $navMenuScriptTagPattern, "")
    $updated = [regex]::Replace($updated, $galleryScriptTagPattern, "")
    $updated = [regex]::Replace($updated, $servicePagesCssTagPattern, "")
    $updated = [regex]::Replace($updated, $heroEnhancementsCssTagPattern, "")
    $updated = [regex]::Replace($updated, $archiveCardsCssTagPattern, "")
    $updated = Decode-CloudflareEmailsInHtml -Content $updated
    $updated = Convert-MaskUrlsToDataUris -Content $updated -CurrentDirectoryPath $currentDirectoryPath -SiteRootPath $siteRoot
    if ($updated -match 'class=["''][^"'']*elementor-widget-nav-menu[^"'']*["'']' -and $updated -notmatch 'nav-menu-fallback\.js') {
        $updated = $updated -replace '</body>', "$navMenuScriptTag`r`n</body>"
    }
    $updated = Convert-LocalUrlsInText -Content $updated -CurrentDirectoryUri $currentDirectoryUri -SiteRootUri $siteRootUri
    $updated = [regex]::Replace(
        $updated,
        '(?<prefix>\bhref=["''])(?<url>[^"'']+)(?<suffix>["''])',
        {
            param($match)
            $url = Convert-LocalPageHref -Url $match.Groups["url"].Value -CurrentDirectoryPath $currentDirectoryPath -SiteRootPath $siteRoot -CurrentDirectoryUri $currentDirectoryUri -SiteRootUri $siteRootUri
            return $match.Groups["prefix"].Value + $url + $match.Groups["suffix"].Value
        }
    )
    $updated = Remove-ElementorInvisibleClass -Content $updated
    $updated = Inline-ElementorGalleryThumbnails -Content $updated

    if ($updated -match 'class=["''][^"'']*elementor-widget-gallery[^"'']*["'']' -and $updated -notmatch 'gallery-fallback\.js') {
        $updated = $updated -replace '</body>', "$galleryScriptTag`r`n</body>"
    }

    if ($updated -match '<form class="elementor-form"' -and $updated -notmatch 'forms-handler\.js') {
        $updated = $updated -replace '</body>', "$formsScriptTag`r`n</body>"
    }

    if ($updated -match 'data-elementor-type="single-post"' -and $updated -notmatch 'service-pages-fallback\.css') {
        $updated = $updated -replace '</head>', "$servicePagesCssTag`r`n</head>"
    }

    if ($updated -notmatch 'hero-background-enhancements\.css') {
        $updated = $updated -replace '</head>', "$heroEnhancementsCssTag`r`n</head>"
    }

    if ($updated -match 'archive-posts\.archive_cards' -and $updated -notmatch 'archive-cards-fallback\.css') {
        $updated = $updated -replace '</head>', "$archiveCardsCssTag`r`n</head>"
    }

    if ($updated -ne $content) {
        Set-Content -LiteralPath $file.FullName -Value $updated -NoNewline
    }
}

foreach ($file in $cssFiles) {
    $content = Get-Content -LiteralPath $file.FullName -Raw
    $currentDirectoryUri = Get-DirectoryUri -Path $file.DirectoryName
    $currentDirectoryPath = (Resolve-Path -LiteralPath $file.DirectoryName).Path
    $updated = Convert-MaskUrlsToDataUris -Content $content -CurrentDirectoryPath $currentDirectoryPath -SiteRootPath $siteRoot
    $updated = Convert-LocalUrlsInText -Content $updated -CurrentDirectoryUri $currentDirectoryUri -SiteRootUri $siteRootUri

    if ($updated -ne $content) {
        Set-Content -LiteralPath $file.FullName -Value $updated -NoNewline
    }
}

foreach ($relativePath in $unusedPaths) {
    $fullPath = Join-Path $siteRoot $relativePath
    if (Test-Path -LiteralPath $fullPath) {
        Remove-Item -LiteralPath $fullPath -Recurse -Force
    }
}

Write-Host "Optimized static export at $siteRoot"
