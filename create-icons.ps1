Add-Type -AssemblyName System.Drawing

function Create-ContrastIcon {
    param (
        [int]$Size,
        [string]$OutputPath
    )
    
    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    # Clear background with rounded corners effect
    $g.Clear([System.Drawing.Color]::Transparent)
    
    # Create rounded rectangle path
    $radius = [int]($Size * 0.15)
    $rect = New-Object System.Drawing.Rectangle 0, 0, $Size, $Size
    
    # Fill left half with black
    $leftRect = New-Object System.Drawing.Rectangle 0, 0, ($Size/2), $Size
    $blackBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
    $g.FillRectangle($blackBrush, $leftRect)
    
    # Fill right half with white
    $rightRect = New-Object System.Drawing.Rectangle ($Size/2), 0, ($Size/2), $Size
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillRectangle($whiteBrush, $rightRect)
    
    # Add border
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(102, 126, 234), [Math]::Max(1, $Size/32))
    $g.DrawRectangle($borderPen, 0, 0, $Size-1, $Size-1)
    
    # Add "Aa" text
    $fontSize = [int]($Size * 0.35)
    $font = New-Object System.Drawing.Font('Segoe UI', $fontSize, [System.Drawing.FontStyle]::Bold)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    # Draw white "A" on black side
    $leftTextRect = New-Object System.Drawing.RectangleF(0, 0, ($Size/2), $Size)
    $g.DrawString('A', $font, $whiteBrush, $leftTextRect, $sf)
    
    # Draw black "a" on white side  
    $smallFont = New-Object System.Drawing.Font('Segoe UI', ($fontSize * 0.8), [System.Drawing.FontStyle]::Bold)
    $rightTextRect = New-Object System.Drawing.RectangleF(($Size/2), 0, ($Size/2), $Size)
    $g.DrawString('a', $smallFont, $blackBrush, $rightTextRect, $sf)
    
    $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $g.Dispose()
    $font.Dispose()
    $smallFont.Dispose()
    $blackBrush.Dispose()
    $whiteBrush.Dispose()
    $borderPen.Dispose()
    $bmp.Dispose()
}

# Create icons in different sizes
Create-ContrastIcon -Size 16 -OutputPath "icon16.png"
Create-ContrastIcon -Size 48 -OutputPath "icon48.png"
Create-ContrastIcon -Size 128 -OutputPath "icon128.png"

Write-Host "Contrast icons created successfully"