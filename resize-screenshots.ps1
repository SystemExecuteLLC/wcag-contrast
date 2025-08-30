Add-Type -AssemblyName System.Drawing

function Resize-Screenshot {
    param (
        [string]$InputPath,
        [int]$Width,
        [int]$Height,
        [string]$OutputPath
    )
    
    $srcImage = [System.Drawing.Image]::FromFile($InputPath)
    Write-Host "Original size: $($srcImage.Width)x$($srcImage.Height)"
    
    # Create new bitmap with exact dimensions
    $destImage = New-Object System.Drawing.Bitmap $Width, $Height
    $graphics = [System.Drawing.Graphics]::FromImage($destImage)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # Calculate scaling to fit
    $srcRatio = $srcImage.Width / $srcImage.Height
    $destRatio = $Width / $Height
    
    if ($srcRatio -gt $destRatio) {
        # Source is wider, fit to width
        $scale = $Width / $srcImage.Width
        $newHeight = [int]($srcImage.Height * $scale)
        $y = [int](($Height - $newHeight) / 2)
        $graphics.Clear([System.Drawing.Color]::White)
        $graphics.DrawImage($srcImage, 0, $y, $Width, $newHeight)
    } else {
        # Source is taller, fit to height
        $scale = $Height / $srcImage.Height
        $newWidth = [int]($srcImage.Width * $scale)
        $x = [int](($Width - $newWidth) / 2)
        $graphics.Clear([System.Drawing.Color]::White)
        $graphics.DrawImage($srcImage, $x, 0, $newWidth, $Height)
    }
    
    $destImage.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "Saved: $OutputPath ($Width x $Height)"
    
    $graphics.Dispose()
    $destImage.Dispose()
    $srcImage.Dispose()
}

# Chrome Web Store requires EXACT dimensions
# Screenshots must be either 1280x800 or 640x400

$screenshot1 = "C:\Users\steve\Downloads\wcag-store-screenshot-1280x800_2025-08-30T18-38-35-556Z.png"
$screenshot2 = "C:\Users\steve\Downloads\wcag-store-screenshot-640x400_2025-08-30T18-38-43-629Z.png"

if (Test-Path $screenshot1) {
    Resize-Screenshot -InputPath $screenshot1 `
                     -Width 1280 `
                     -Height 800 `
                     -OutputPath "C:\Users\steve\source\repos\wcag-contrast\screenshot-1280x800.png"
}

if (Test-Path $screenshot2) {
    Resize-Screenshot -InputPath $screenshot2 `
                     -Width 640 `
                     -Height 400 `
                     -OutputPath "C:\Users\steve\source\repos\wcag-contrast\screenshot-640x400.png"
}

Write-Host "`nScreenshots resized to exact Chrome Web Store dimensions!"