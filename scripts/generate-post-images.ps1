param(
  [string]$OutDir = "public/images/posts"
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$items = @(
  @{
    Slug = "000-about"
    Title = "About Vibecode Town"
    Subtitle = "Evidence-backed field notes"
    Signal = "failure -> contract -> proof"
    Accent = "#B95B36"
    Motif = "stack"
  },
  @{
    Slug = "design-is-a-technical-contract"
    Title = "DESIGN.md"
    Subtitle = "Reasoning and tokens in one file"
    Signal = "roles -> components -> lint"
    Accent = "#8E4C9E"
    Motif = "tokens"
  },
  @{
    Slug = "ai-agent-work-disk-contract"
    Title = "AI Work Disk Contract"
    Subtitle = "Temp paths become part of the system"
    Signal = "scratch -> build -> archive"
    Accent = "#2E6F7E"
    Motif = "disk"
  },
  @{
    Slug = "frustration-as-spec"
    Title = "Frustration Signal"
    Subtitle = "Repeated correction becomes a gate"
    Signal = "complaint -> contract -> verifier"
    Accent = "#B04444"
    Motif = "signal"
  },
  @{
    Slug = "ai-memory-operating-structure"
    Title = "AI Memory Structure"
    Subtitle = "Long prompts are not memory"
    Signal = "notes -> index -> handoff"
    Accent = "#526E35"
    Motif = "memory"
  },
  @{
    Slug = "mcp-shared-state-data-leak"
    Title = "MCP Shared State Leak"
    Subtitle = "Stateless servers can still leak lifecycle state"
    Signal = "session A | boundary | B"
    Accent = "#2F5D9B"
    Motif = "network"
  },
  @{
    Slug = "software-3-0"
    Title = "Software 3.0"
    Subtitle = "Generation got cheap; review did not"
    Signal = "context -> diff -> evidence"
    Accent = "#6857A8"
    Motif = "kernel"
  },
  @{
    Slug = "html-review-artifacts-for-agents"
    Title = "HTML Review Artifacts"
    Subtitle = "Readable review surfaces, not canon"
    Signal = "canon -> html -> export"
    Accent = "#C7772F"
    Motif = "html"
  },
  @{
    Slug = "vercel-is-not-a-deployment-contract"
    Title = "Deployment Contract"
    Subtitle = "A host is not a guarantee"
    Signal = "build / routes / smoke test"
    Accent = "#2B7560"
    Motif = "deploy"
  },
  @{
    Slug = "what-vibe-coding-actually-is"
    Title = "Vibe Coding"
    Subtitle = "Exploration is not production"
    Signal = "intent -> contract -> verification"
    Accent = "#A35F2B"
    Motif = "deconstruct"
  }
)

function ColorFromHex([string]$hex) {
  $clean = $hex.TrimStart("#")
  return [System.Drawing.Color]::FromArgb(
    [Convert]::ToInt32($clean.Substring(0, 2), 16),
    [Convert]::ToInt32($clean.Substring(2, 2), 16),
    [Convert]::ToInt32($clean.Substring(4, 2), 16)
  )
}

function New-Pen([string]$hex, [float]$width = 2) {
  return [System.Drawing.Pen]::new((ColorFromHex $hex), $width)
}

function New-Brush([string]$hex) {
  return [System.Drawing.SolidBrush]::new((ColorFromHex $hex))
}

function Draw-RoundRect($graphics, $pen, $brush, [int]$x, [int]$y, [int]$w, [int]$h, [int]$r) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  if ($brush -ne $null) { $graphics.FillPath($brush, $path) }
  if ($pen -ne $null) { $graphics.DrawPath($pen, $path) }
  $path.Dispose()
}

function Draw-Motif($graphics, $item, $accentBrush, $accentPen, $inkPen, $mutedPen, $paperBrush) {
  $x = 705
  $y = 132
  $w = 392
  $h = 350
  Draw-RoundRect $graphics $mutedPen $paperBrush $x $y $w $h 24

  switch ($item.Motif) {
    "stack" {
      for ($i = 0; $i -lt 4; $i++) {
        Draw-RoundRect $graphics $accentPen $null ($x + 42 + ($i * 22)) ($y + 50 + ($i * 44)) 250 42 10
      }
      $graphics.DrawLine($inkPen, $x + 78, $y + 260, $x + 312, $y + 260)
      $graphics.DrawLine($accentPen, $x + 312, $y + 260, $x + 335, $y + 238)
    }
    "tokens" {
      $colors = @("#21170F", "#F8F1E7", $item.Accent, "#D9CABA")
      for ($i = 0; $i -lt 4; $i++) {
        $brush = New-Brush $colors[$i]
        $graphics.FillEllipse($brush, $x + 56 + ($i * 72), $y + 70, 48, 48)
        $brush.Dispose()
      }
      $graphics.DrawLine($accentPen, $x + 88, $y + 180, $x + 296, $y + 180)
      $graphics.DrawLine($accentPen, $x + 296, $y + 180, $x + 296, $y + 260)
      Draw-RoundRect $graphics $inkPen $null ($x + 80) ($y + 230) 220 52 12
    }
    "disk" {
      for ($i = 0; $i -lt 3; $i++) {
        $graphics.DrawEllipse($accentPen, $x + 70, $y + 60 + ($i * 62), 250, 48)
        $graphics.DrawLine($mutedPen, $x + 70, $y + 84 + ($i * 62), $x + 320, $y + 84 + ($i * 62))
      }
      $graphics.DrawLine($inkPen, $x + 195, $y + 260, $x + 195, $y + 310)
      $graphics.DrawLine($accentPen, $x + 166, $y + 302, $x + 195, $y + 330)
      $graphics.DrawLine($accentPen, $x + 224, $y + 302, $x + 195, $y + 330)
    }
    "signal" {
      $points = @(
        [System.Drawing.Point]::new($x + 52, $y + 260),
        [System.Drawing.Point]::new($x + 112, $y + 246),
        [System.Drawing.Point]::new($x + 152, $y + 118),
        [System.Drawing.Point]::new($x + 204, $y + 285),
        [System.Drawing.Point]::new($x + 268, $y + 168),
        [System.Drawing.Point]::new($x + 338, $y + 232)
      )
      $graphics.DrawLines($accentPen, $points)
      $graphics.DrawLine($mutedPen, $x + 52, $y + 300, $x + 338, $y + 300)
      $graphics.DrawLine($mutedPen, $x + 52, $y + 80, $x + 52, $y + 300)
    }
    "memory" {
      for ($row = 0; $row -lt 4; $row++) {
        for ($col = 0; $col -lt 3; $col++) {
          Draw-RoundRect $graphics $accentPen $null ($x + 64 + ($col * 86)) ($y + 58 + ($row * 62)) 54 34 8
        }
      }
      $graphics.DrawLine($inkPen, $x + 92, $y + 92, $x + 264, $y + 278)
    }
    "network" {
      $nodes = @(
        @(92, 90), @(280, 82), @(196, 176), @(96, 270), @(292, 268)
      )
      foreach ($a in $nodes) {
        foreach ($b in $nodes) {
          if ($a -ne $b) { $graphics.DrawLine($mutedPen, $x + $a[0], $y + $a[1], $x + $b[0], $y + $b[1]) }
        }
      }
      foreach ($n in $nodes) {
        $graphics.FillEllipse($accentBrush, $x + $n[0] - 18, $y + $n[1] - 18, 36, 36)
      }
      $graphics.DrawLine($inkPen, $x + 196, $y + 50, $x + 196, $y + 310)
    }
    "kernel" {
      $graphics.FillEllipse($accentBrush, $x + 145, $y + 105, 110, 110)
      for ($i = 0; $i -lt 12; $i++) {
        $angle = ($i * 30) * [Math]::PI / 180
        $x1 = $x + 200 + [Math]::Cos($angle) * 76
        $y1 = $y + 160 + [Math]::Sin($angle) * 76
        $x2 = $x + 200 + [Math]::Cos($angle) * 138
        $y2 = $y + 160 + [Math]::Sin($angle) * 138
        $graphics.DrawLine($accentPen, [float]$x1, [float]$y1, [float]$x2, [float]$y2)
      }
      Draw-RoundRect $graphics $inkPen $null ($x + 88) ($y + 270) 230 44 10
    }
    "html" {
      Draw-RoundRect $graphics $accentPen $null ($x + 64) ($y + 76) 260 190 14
      $graphics.DrawLine($mutedPen, $x + 64, $y + 122, $x + 324, $y + 122)
      $graphics.DrawString("<article>", [System.Drawing.Font]::new("Consolas", 24, [System.Drawing.FontStyle]::Bold), $accentBrush, $x + 104, $y + 158)
      $graphics.DrawString("copy export", [System.Drawing.Font]::new("Consolas", 18), (New-Brush "#6F6257"), $x + 116, $y + 292)
    }
    "deploy" {
      Draw-RoundRect $graphics $accentPen $null ($x + 68) ($y + 78) 110 78 12
      Draw-RoundRect $graphics $inkPen $null ($x + 220) ($y + 78) 110 78 12
      Draw-RoundRect $graphics $mutedPen $null ($x + 144) ($y + 238) 110 78 12
      $graphics.DrawLine($accentPen, $x + 178, $y + 116, $x + 220, $y + 116)
      $graphics.DrawLine($accentPen, $x + 258, $y + 156, $x + 202, $y + 238)
      $graphics.DrawLine($accentPen, $x + 122, $y + 156, $x + 166, $y + 238)
    }
    default {
      $graphics.DrawLine($inkPen, $x + 70, $y + 270, $x + 318, $y + 88)
      $graphics.DrawLine($accentPen, $x + 70, $y + 88, $x + 318, $y + 270)
      Draw-RoundRect $graphics $accentPen $null ($x + 116) ($y + 126) 160 110 20
    }
  }
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

foreach ($item in $items) {
  $bmp = [System.Drawing.Bitmap]::new(1200, 630)
  $graphics = [System.Drawing.Graphics]::FromImage($bmp)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $paper = New-Brush "#F8F1E7"
  $panel = New-Brush "#FFFAF2"
  $ink = New-Brush "#21170F"
  $muted = New-Brush "#6F6257"
  $accent = New-Brush $item.Accent
  $linePen = New-Pen "#D9CABA" 2
  $mutedPen = New-Pen "#D9CABA" 3
  $inkPen = New-Pen "#21170F" 5
  $accentPen = New-Pen $item.Accent 6

  $graphics.FillRectangle($paper, 0, 0, 1200, 630)

  for ($x = 0; $x -le 1200; $x += 40) {
    $graphics.DrawLine($linePen, $x, 0, $x, 630)
  }
  for ($y = 0; $y -le 630; $y += 40) {
    $graphics.DrawLine($linePen, 0, $y, 1200, $y)
  }

  Draw-RoundRect $graphics $linePen $panel 58 58 1084 514 26

  $labelFont = [System.Drawing.Font]::new("Consolas", 24, [System.Drawing.FontStyle]::Bold)
  $titleSize = 48
  if ($item.Title.Length -gt 27) { $titleSize = 40 }
  if ($item.Title.Length -gt 35) { $titleSize = 34 }
  $titleFont = [System.Drawing.Font]::new("Georgia", $titleSize, [System.Drawing.FontStyle]::Bold)
  $subFont = [System.Drawing.Font]::new("Georgia", 26)
  $monoFont = [System.Drawing.Font]::new("Consolas", 20)

  $graphics.DrawString("VIBECODE / POST IMAGE CONTRACT", $labelFont, $accent, 92, 92)
  $titleRect = [System.Drawing.RectangleF]::new(92, 148, 560, 126)
  $titleFormat = [System.Drawing.StringFormat]::new()
  $titleFormat.Trimming = [System.Drawing.StringTrimming]::EllipsisWord
  $graphics.DrawString($item.Title, $titleFont, $ink, $titleRect, $titleFormat)
  $graphics.DrawString($item.Subtitle, $subFont, $muted, 96, 288)
  Draw-RoundRect $graphics $accentPen $null 96 388 470 74 12
  $graphics.DrawString($item.Signal, $monoFont, $ink, 122, 412)
  $graphics.DrawString("/images/posts/" + $item.Slug + ".png", [System.Drawing.Font]::new("Consolas", 16), $muted, 96, 502)

  Draw-Motif $graphics $item $accent $accentPen $inkPen $mutedPen $panel

  $target = Join-Path $OutDir ($item.Slug + ".png")
  $bmp.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)

  $graphics.Dispose()
  $bmp.Dispose()
  $paper.Dispose()
  $panel.Dispose()
  $ink.Dispose()
  $muted.Dispose()
  $accent.Dispose()
  $linePen.Dispose()
  $mutedPen.Dispose()
  $inkPen.Dispose()
  $accentPen.Dispose()
  $titleFormat.Dispose()

  $size = (Get-Item -LiteralPath $target).Length
  Write-Output "$target $size"
}
