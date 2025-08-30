Add-Type -AssemblyName System.Drawing

function Create-PromoTile {
    param (
        [int]$Width,
        [int]$Height,
        [string]$OutputPath
    )
    
    $bmp = New-Object System.Drawing.Bitmap $Width, $Height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    
    # Create gradient background
    $rect = New-Object System.Drawing.Rectangle 0, 0, $Width, $Height
    $gradientBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(102, 126, 234),
        [System.Drawing.Color]::FromArgb(118, 75, 162),
        45
    )
    $g.FillRectangle($gradientBrush, $rect)
    
    # Add contrast demonstration
    $demoSize = [int]($Height * 0.3)
    $demoX = [int]($Width * 0.1)
    $demoY = [int]($Height * 0.35)
    
    # Left half - black with white text
    $leftRect = New-Object System.Drawing.Rectangle $demoX, $demoY, ($demoSize/2), $demoSize
    $blackBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
    $g.FillRectangle($blackBrush, $leftRect)
    
    # Right half - white with black text
    $rightRect = New-Object System.Drawing.Rectangle ($demoX + $demoSize/2), $demoY, ($demoSize/2), $demoSize
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillRectangle($whiteBrush, $rightRect)
    
    # Add demo text
    $demoFont = New-Object System.Drawing.Font('Segoe UI', ($demoSize * 0.25), [System.Drawing.FontStyle]::Bold)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $leftTextRect = New-Object System.Drawing.RectangleF $demoX, $demoY, ($demoSize/2), $demoSize
    $g.DrawString('Aa', $demoFont, $whiteBrush, $leftTextRect, $sf)
    
    $rightTextRect = New-Object System.Drawing.RectangleF ($demoX + $demoSize/2), $demoY, ($demoSize/2), $demoSize
    $g.DrawString('Aa', $demoFont, $blackBrush, $rightTextRect, $sf)
    
    # Add title
    $titleFont = New-Object System.Drawing.Font('Segoe UI', ($Height * 0.08), [System.Drawing.FontStyle]::Bold)
    $titleRect = New-Object System.Drawing.RectangleF ($Width * 0.45), ($Height * 0.15), ($Width * 0.5), ($Height * 0.2)
    $g.DrawString('WCAG Contrast Fixer', $titleFont, $whiteBrush, $titleRect, $sf)
    
    # Add subtitle
    $subtitleFont = New-Object System.Drawing.Font('Segoe UI', ($Height * 0.045), [System.Drawing.FontStyle]::Regular)
    $subtitleRect = New-Object System.Drawing.RectangleF ($Width * 0.45), ($Height * 0.35), ($Width * 0.5), ($Height * 0.3)
    $subtitleText = "Automatically fixes text contrast to meet WCAG 2.1 AA/AAA standards"
    $g.DrawString($subtitleText, $subtitleFont, $whiteBrush, $subtitleRect, $sf)
    
    # Add features
    $featureFont = New-Object System.Drawing.Font('Segoe UI', ($Height * 0.035), [System.Drawing.FontStyle]::Regular)
    $featureY = $Height * 0.65
    $features = @(
        "• Smart contrast detection",
        "• Force high contrast mode", 
        "• Bold text option",
        "• Works on all websites"
    )
    
    $lineHeight = $Height * 0.06
    for ($i = 0; $i -lt $features.Length; $i++) {
        $featureRect = New-Object System.Drawing.RectangleF ($Width * 0.45), ($featureY + $i * $lineHeight), ($Width * 0.5), $lineHeight
        $sf.Alignment = [System.Drawing.StringAlignment]::Near
        $g.DrawString($features[$i], $featureFont, $whiteBrush, $featureRect, $sf)
    }
    
    $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $g.Dispose()
    $gradientBrush.Dispose()
    $blackBrush.Dispose()
    $whiteBrush.Dispose()
    $titleFont.Dispose()
    $subtitleFont.Dispose()
    $featureFont.Dispose()
    $demoFont.Dispose()
    $bmp.Dispose()
}

# Create promotional tiles
Create-PromoTile -Width 1280 -Height 800 -OutputPath "promo-large.png"
Create-PromoTile -Width 640 -Height 400 -OutputPath "promo-small.png"
Create-PromoTile -Width 1400 -Height 560 -OutputPath "promo-marquee.png"

Write-Host "Store promotional assets created successfully"