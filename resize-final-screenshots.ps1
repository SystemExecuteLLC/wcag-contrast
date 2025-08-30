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

# Process the screenshot with popup visible
$screenshot = "C:\Users\steve\Downloads\wcag-popup-visible-final_2025-08-30T18-45-10-958Z.png"

if (Test-Path $screenshot) {
    # Create 1280x800 version
    Resize-Screenshot -InputPath $screenshot `
                     -Width 1280 `
                     -Height 800 `
                     -OutputPath "C:\Users\steve\source\repos\wcag-contrast\screenshot-popup-1280x800.png"
    
    # Create 640x400 version
    Resize-Screenshot -InputPath $screenshot `
                     -Width 640 `
                     -Height 400 `
                     -OutputPath "C:\Users\steve\source\repos\wcag-contrast\screenshot-popup-640x400.png"
    
    Write-Host "`nScreenshots with popup resized successfully!"
} else {
    Write-Host "Screenshot file not found!"
}