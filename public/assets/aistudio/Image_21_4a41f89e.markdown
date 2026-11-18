---
name: Kinetic Neo-Brutalist
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#4d4632'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#7f775f'
  outline-variant: '#d0c6ab'
  surface-tint: '#705d00'
  primary: '#705d00'
  on-primary: '#ffffff'
  primary-container: '#ffd60a'
  on-primary-container: '#705d00'
  inverse-primary: '#e9c400'
  secondary: '#b5005f'
  on-secondary: '#ffffff'
  secondary-container: '#e20078'
  on-secondary-container: '#fffbff'
  tertiary: '#5d5f5f'
  on-tertiary: '#ffffff'
  tertiary-container: '#d9d9d9'
  on-tertiary-container: '#5d5f5f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe171'
  primary-fixed-dim: '#e9c400'
  on-primary-fixed: '#221b00'
  on-primary-fixed-variant: '#554600'
  secondary-fixed: '#ffd9e2'
  secondary-fixed-dim: '#ffb1c7'
  on-secondary-fixed: '#3e001d'
  on-secondary-fixed-variant: '#8e0049'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 72px
    fontWeight: '800'
    lineHeight: 76px
    letterSpacing: -0.04em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  body-md:
    fontFamily: Space Grotesk
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 22px
  body-sm:
    fontFamily: Space Grotesk
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  mono-lg:
    fontFamily: Space Mono
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: -0.02em
  mono-md:
    fontFamily: Space Mono
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0em
  mono-sm:
    fontFamily: Space Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-caps:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 2rem
  margin-sm: 1rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system delivers an unapologetic, high-velocity aesthetic at the intersection of raw digital brutalism and industrial utility. Crafted for high-density developer platforms, avant-garde tech ecosystems, and high-cadence interfaces, it rejects synthetic gradients and passive minimalism in favor of structural clarity, hard contrasts, and tactile responsiveness.

The visual language balances architectural precision with electric energy:
- **Aesthetic Movement:** High-Contrast Neo-Brutalism. Structural, functionalist, and deliberately unyielding.
- **Audience & Mindset:** Builders, engineers, technical creatives, and operators who demand fast visual parsing, radical transparency, and tangible tactile feedback.
- **Emotional Stance:** Loud, urgent, mechanically precise, and irreverent. Every UI element acts like a physical stamping, print-block, or mechanical toggle.

## Colors

The palette leverages high-visibility industrial warnings, clinical substrate whites, and hyper-saturated accent strikes. High contrast is mandatory across all viewports.

### Palette Assignment & Roles
- **Primary (`#FFD60A` - Safety Yellow):** Used for focal action points, hero callouts, alert banners, and active component states. Demands immediate visual priority.
- **Secondary (`#E6007A` - Hot Magenta):** Reserved for destructive triggers, live metrics, critical status tags, badges, and sharp accents.
- **Tertiary (`#EDEDED` - Concrete Grey):** The structural neutral. Applied to muted panels, table striping, secondary cards, and inactive field backgrounds.
- **Neutral (`#0D0D0D` - Ink Black):** The universal structural key. Used for all primary typography, icons, strict 3px outlines, and hard 0-blur drop shadows.
- **Base Canvas (`#FFFFFF` - Paper White):** The base operational surface providing maximum contrast against Ink Black ink and Safety Yellow blocks.

### Composition Guidelines
- Never soften black borders with opacity; borders and drop-shadows remain `#0D0D0D` at 100% alpha.
- High-contrast state mapping: Buttons and interactive cards transition between Paper White and Safety Yellow, or Safety Yellow and Ink Black with inverted text.

## Typography

Typography acts as a dynamic structural element rather than quiet copy. We pair an imposing, tightly tracked Grotesk (`Space Grotesk`) with an industrial, mechanical monospace (`Space Mono`).

### Hierarchy & Role Distribution
- **Headlines & Display:** Set in tight-tracked, heavy weights of Space Grotesk. Characters pack tightly to form solid typographic blocks. Headlines must not use soft line-heights.
- **Body & Prose:** Mid-weight Space Grotesk ensures legibility while sustaining angular brutalist personality.
- **Labels, Telemetry, and Metadata:** Space Mono handles timestamps, counts, data metrics, tabular values, and uppercase category ribbons.
- **Casing Rules:** Structural tags, column headers, and action flags default to full uppercase (`label-caps`) with open tracking.

## Layout & Spacing

The layout model enforces deliberate, architectural alignment. It relies on a rigorous 12-column responsive fluid grid pinned within defined bounding margins.

### Breakpoints & Fluid Grid Mechanics
- **Mobile (< 768px):** 4-column layout, `margin-sm` (1rem / 16px), `gutter-sm` (1rem / 16px). Hard horizontal panel borders span full-bleed to eliminate dead gutter space.
- **Tablet (768px - 1024px):** 8-column layout, `margin` (2rem / 32px), `gutter` (1.5rem / 24px).
- **Desktop (L
NŠŠˆL‹XÛÛ[[ˆ^[Ý]X\™Ú[‹[Ø
Ü™[HÈ
KÝ]\‹[Ø
œ™[HÈÌœ
KˆX^[][HÛÛZ[™\ˆÚYÛ[\È]M‚‚ˆÈÈÈÜXÚ[™Èš[˜Ú\\Â‹H[œÚ]H\È[[[Û˜[HÛÛ\XÝÈYY][KˆRHÝ\™˜XÙ\È\ÙHÛÛYÝXÝ\˜[Y[™È˜]\ˆ[ˆ]\™X[[\[™\ÜË‚‹H[\›˜[ÛÛ\Û™[Ø\È›ÛÝÈÝšXÝ][\\ÈÙˆ[™ˆÜXÙK^Ø

KÜXÙK\ÛX

KÜXÙK[Y
Mœ
KÜXÙK[Ø

KÜXÙK^

K‚‹Hš\ÝX[]šY\œÈ\™H[™ÚX›HÜÌ[™HÝ›ÚÙ\È˜]\ˆ[ˆ[\HÚ]\ÜXÙHØ\Ë‚‚ˆÈÈ[]˜][Ûˆ	ˆ\‚•\È\ÚYÛˆÞ\Ý[HÛÛ\][H\ØØ\™È[XšY[›\œËÜ˜YY[ÛÝÜË[™][ÜÜ\šXÈ›Ü\ÚYÝÜËˆ\\È\™[H\ÚXØ[\™YYÙY[™\™XÝ[Û˜[‚‚ˆÈÈÈH\™Ù™œÙ]ÚYÝÂ‹H
Š”Ý[™\™Ý]NŠŠˆ[›Ø][™È[[Y[ËØ\™Ë[™[\˜XÝ]™H›ØÚÜÈ›Ú™XÝHÚ\œL	HÜ\]YHÙ™œÙ]ÚYÝÎ‚ˆ›Þ\ÚYÝÎˆœœÌØ‹H
Š”™\Ý[™ÈÈÛÛ\XÝÝ]H
˜YÙ\ËÛX[Ú\ÊNŠŠ‚ˆ›Þ\ÚYÝÎˆÜÜÌØ‹H
Š‘[]˜]YÝ™\ˆÝ]NŠŠ‚ˆ˜[œÛ]\ÈÜ[Y
˜[œÙ›Ü›Nˆ˜[œÛ]JLœLœ
X
HÚ[H^[™[™ÈHÚYÝÎ‚ˆ›Þ\ÚYÝÎˆÌØ‹H
ŠXÝ]™HÈ™\ÜÙYÝ]NŠŠ‚ˆÛ˜\ÈÛÛ\][H›\Ú[ÈH[™H
˜[œÙ›Ü›Nˆ˜[œÛ]Jœœ
X
K™\Ù][™ÈÚYÝÎ‚ˆ›Þ\ÚYÝÎˆÌØ‚ˆÈÈÈ›Ü™\ˆ[\Â‹H]™\žH[]˜]Y[Ù[K[œ]šY[[™ÙYÛY[Y^[Ý]ÛÛZ[™\ˆ\È[˜ÚÜ™YžHH\œÚ\Ý[ÜÛÛYÌ›Ü™\‹‚‹H›Ü™\‹X›ÞÚ^š[™È\È[š]™\œØ[ˆ™\ÝYÜ]XÛÛZ[™\œÈÚ\™H›Ü™\œÈ
ÛÛ\ÙYÜˆÝXÚ[™ÈÜÙX[\ÊK‚‚ˆÈÈÚ\\Â‚•Hš[X\žHÙ[ÛY]žH\È[˜\ÛÙÙ]XØ[HÜ]X\™Y

KˆÙ[ÛY]žH™Y›XÝÈÝXÝ\˜[ÝY[\ÚXØ[Ù™œÙ]š[[™Ë[™Ú\œ\™Ø\™H[™[Ë‚‚ˆÈÈÈÙ[ÛY]šXÈ[\Â‹H
Š˜\ÙHš[Z]]™\ÎŠŠˆ]ÛœËØ\™Ë[Ù[Ë›ÜÝÛˆY[\Ë[™˜[›™\œÈ]™HXœÛÛ]H›Ü™\ˆ˜Y]\Ë‚‹H
Š“ZXÜ›È˜YZH^Ù\[ÛŽŠŠˆÙXÛÛ™\žHÝX‹Y[[Y[ÈÜˆ[YÜÈ™\]Z\š[™ÈY™™\™[X][ÛˆØ[ˆÜ[Û˜[HØØ[HÈ[ˆ[˜K\ÝšXÝX^[][HÙˆ
›Ý[™Y\ÛX
K]]\Ý™]™\ˆ\ÙHÚ\˜Ý[\ˆÜˆ›ZY[›Ý[™[™ÜË‚‹H
Š”›Ý][Û˜[[™Û\È
ÝXÚÙ\ˆ\ÚXÜÊNŠŠˆYÚYÚ˜YÙ\Ë›Û[Ý[Û˜[Ø[Ý]Ë[™XÝ]™H[[Y]žHÚ\ÈX^H\HÛYÚ[[[Û˜[›Ý][ÛˆÝ[\È
L™YØÈ
Ì‹YYØ
HÈœ™XZÈ^[Ý]šYÚY]H[™Z[ZXÈ\ÚXØ[ÝXÚÙ\œË‚‚ˆÈÈÛÛ\Û™[Â‚ˆÈÈÈ]ÛœÂ‹H
Š”š[X\žH]ÛŽŠŠˆ˜XÚÙÜ›Ý[™Ñ‘‘ŒXÛÛÜˆÌ›Ü™\ˆÜÛÛYÌ›ÛÜXÙHÜ›Ý\ÚØÌ\\˜Ø\ÙKÚYÝÈœœÌ‚‹H
Š”ÙXÛÛ™\žH]ÛŽŠŠˆ˜XÚÙÜ›Ý[™Ñ‘‘‘‘‘˜ÛÛÜˆÌ›Ü™\ˆÜÛÛYÌÚYÝÈœœÌˆÝ™\ˆÚYÈš[ÈÑQQQ‚‹H
Š‘\ÝXÝ]™HÈXØÙ[]ÛŽŠŠˆ˜XÚÙÜ›Ý[™ÑMŒÐXÛÛÜˆÑ‘‘‘‘‘˜›Ü™\ˆÜÛÛYÌÚYÝÈœœÌ‚‹H
Š“[Ý[ÛŽŠŠˆÛˆÝ™\Žˆ˜[œÙ›Ü›Nˆ˜[œÛ]JLœLœ
NÈ›Þ\ÚYÝÎˆÌØˆÛˆXÝ]™Nˆ˜[œÙ›Ü›Nˆ˜[œÛ]Jœœ
NÈ›Þ\ÚYÝÎˆÌØˆ˜[œÚ][Ûˆ\˜][ÛˆL\ÈX\ÙK[Ý]‚‚ˆÈÈÈØ\™È	ˆ[™[Â‹H
Š”Ý[™\™Ø\™ŠŠˆ˜XÚÙÜ›Ý[™Ñ‘‘‘‘‘˜ÜˆÑQQQ›Ü™\ˆÜÛÛYÌÚYÝÈœœÌ[\›˜[Y[™ÈÜXÙK[Ø‚‹H
Š’[\˜XÝ]™HØ\™ŠŠˆ˜[œÚ][ÛœÈÛˆÝ™\ˆÚ][ˆ\Ø\™Û˜\ˆ˜[œÛ]JLœLœ
X[™ÚYÝÈ^[œÚ[ÛˆÈÌ‚‹H
ŠØ\™XY\œÎŠŠˆ[\Þ\ÈH[œÙHÝXÝ\˜[Ü˜[›™\Žˆ˜XÚÙÜ›Ý[™ÌÛÛÜˆÑ‘‘‘‘‘˜›Ü™\‹X›ÝÛHÜÛÛYÌ\ÙÜ˜\H[Û›Ë[Y\\˜Ø\ÙK‚‚ˆÈÈÈÚ\È	ˆ˜YÙ\Â‹H
Š”Ý]\È˜YÙ\ÎŠŠˆ˜XÚÙÜ›Ý[™ÑMŒÐXÜˆÑ‘‘ŒX^Ì›Ü™\ˆœÛÛYÌÚYÝÈÜÜÌ›Û[Û›Ë\ÛX›Û\\˜Ø\ÙK‚‹H
Š”ÝXÚÙ\ˆ˜YÙ\ÎŠŠˆ\YYÚ]\˜š]˜\žHÛYÚ›Ý][Ûˆ
›Ý]KVËL™Y×X
H›Ø][™ÈÝ™\ˆØ\™ÛÜ›™\œÈÚ]‹Z[™^[]˜][Û‹‚‚ˆÈÈÈ›Ü›H[œ]È	ˆšY[Â‹H
Š•^[œ]ÎŠŠˆ˜XÚÙÜ›Ý[™Ñ‘‘‘‘‘˜›Ü™\ˆÜÛÛYÌ›ÛÜXÙHÜ›Ý\ÚØLY[™ÈÜXÙK\ÛHÜXÙK[Y‚‹H
Š‘›ØÝ\ÈÝ]NŠŠˆ˜XÚÙÜ›Ý[™˜[œÚ][ÛœÈÈÑ‘‘‘‘‘˜ÚYÝÈÛ˜\ÈÝ]Ø\™ÌÝ][™H›Û™K‚‹H
Š’[œ]X™[ÎŠŠˆ›ÛX™[XØ\Ø\\˜Ø\ÙK[›™Y\™XÝHX›Ý™H[œ]Ú]ÜXÙK^ØØ\‚‚ˆÈÈÈÙ[XÝ[ÛˆÛÛ›ÛÈ
ÚXÚØ›Þ\È	ˆ˜Y[ÜÊB‹H
ŠÚXÚØ›ÞŠŠˆÜ]X\™H›Þ
ŒŒ
K›Ü™\ˆÜÛÛYÌ˜XÚÙÜ›Ý[™Ñ‘‘‘‘‘˜ˆÚ[ˆÚXÚÙYˆš[Ñ‘‘ŒXÚ]HX]žH›XÚÈÙ[ÛY]šXÈÚXÚÈÛ\ÜˆÛÛYÌÜ]X\™H[›^K‚‹H
Š”˜Y[È]ÛŽŠŠˆÚ\˜ÛH
ŒŒ
K›Ü™\ˆÜÛÛYÌ˜XÚÙÜ›Ý[™Ñ‘‘‘‘‘˜ˆÚ[ˆÙ[XÝYˆ\™ÛÛYÝÌÙ[\™YÚ]Ø\‚‚ˆÈÈÈX›\È	ˆ\ÝÂ‹H
Š‘]HX›\ÎŠŠˆÝ]\ˆ›Ü™\ˆÜÛÛYÌÚYÝÈœœÌ‚‹H
Š’XY\ˆÙ[ÎŠŠˆ˜XÚÙÜ›Ý[™ÌÛÛÜˆÑ‘‘‘‘‘˜›Ü™\‹X›ÝÛHÜÛÛYÌ›ÛX™[XØ\Ø‚‹H
Š”›ÝÜÎŠŠˆ[\›˜][™È›ÝÜÈÙˆÑ‘‘‘‘‘˜[™ÑQQQÙ\\˜]YžHœÛÛYÌˆÝ™\ˆYÚYÚÈHXÝ]™H›ÝÈ[ˆÑ‘‘ŒX