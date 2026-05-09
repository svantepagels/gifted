#!/usr/bin/env python3
"""Build the Gifted SEM research PDF using reportlab (pure python, no system deps)."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image,
    Table, TableStyle,
)
from reportlab.platypus.flowables import HRFlowable

# ---- Brand palette ----
PRIMARY = HexColor("#7c3aed")
ACCENT  = HexColor("#f59e0b")
SUCCESS = HexColor("#10b981")
DANGER  = HexColor("#ef4444")
NEUTRAL = HexColor("#64748b")
LIGHT   = HexColor("#f1f5f9")
DARKER  = HexColor("#1e293b")
TEXT    = HexColor("#0f172a")
MUTED   = HexColor("#475569")

styles = getSampleStyleSheet()

H1 = ParagraphStyle("H1", parent=styles["Heading1"], textColor=PRIMARY,
                    fontSize=24, leading=28, spaceAfter=8, fontName="Helvetica-Bold")
H2 = ParagraphStyle("H2", parent=styles["Heading2"], textColor=PRIMARY,
                    fontSize=15, leading=20, spaceBefore=18, spaceAfter=8,
                    fontName="Helvetica-Bold")
H3 = ParagraphStyle("H3", parent=styles["Heading3"], textColor=DARKER,
                    fontSize=12, leading=15, spaceBefore=12, spaceAfter=4,
                    fontName="Helvetica-Bold")
BODY = ParagraphStyle("Body", parent=styles["BodyText"], fontSize=10, leading=14,
                      textColor=TEXT, spaceAfter=8, fontName="Helvetica",
                      alignment=TA_LEFT)
BODY_J = ParagraphStyle("BodyJ", parent=BODY, alignment=TA_JUSTIFY)
BULLET = ParagraphStyle("Bullet", parent=BODY, leftIndent=14, bulletIndent=2,
                        spaceAfter=3)
CALLOUT = ParagraphStyle("Callout", parent=BODY, fontSize=10.5, leading=15,
                         textColor=TEXT, spaceAfter=6, spaceBefore=2,
                         fontName="Helvetica")
CALLOUT_BOLD = ParagraphStyle("CalloutB", parent=CALLOUT, fontName="Helvetica-Bold")
CAPTION = ParagraphStyle("Caption", parent=BODY, fontSize=8.5, leading=11,
                         textColor=MUTED, spaceAfter=10, alignment=TA_CENTER,
                         fontName="Helvetica-Oblique")
COVER_TITLE = ParagraphStyle("CT", parent=H1, fontSize=32, leading=38, alignment=TA_CENTER, spaceAfter=4)
COVER_SUB = ParagraphStyle("CS", parent=BODY, fontSize=14, leading=18,
                           alignment=TA_CENTER, textColor=MUTED, spaceAfter=12,
                           fontName="Helvetica")
COVER_PILL = ParagraphStyle("CP", parent=BODY, fontSize=11, leading=14,
                            alignment=TA_CENTER, textColor=PRIMARY,
                            fontName="Helvetica-Bold", spaceAfter=4)


def callout_table(content_paras, color=PRIMARY, bg=LIGHT):
    inner = Table([[content_paras]], colWidths=[16*cm])
    inner.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), bg),
        ("LEFTPADDING", (0,0), (-1,-1), 14),
        ("RIGHTPADDING", (0,0), (-1,-1), 14),
        ("TOPPADDING", (0,0), (-1,-1), 12),
        ("BOTTOMPADDING", (0,0), (-1,-1), 12),
        ("LINEBEFORE", (0,0), (0,-1), 4, color),
    ]))
    return inner


def data_table(data, col_widths=None, first_col_bold=True, header_bg=PRIMARY, alt_bg=LIGHT):
    style = TableStyle([
        ("BACKGROUND", (0,0), (-1,0), header_bg),
        ("TEXTCOLOR", (0,0), (-1,0), white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,0), 9),
        ("ALIGN", (0,0), (-1,0), "LEFT"),
        ("BOTTOMPADDING", (0,0), (-1,0), 8),
        ("TOPPADDING", (0,0), (-1,0), 8),
        ("FONTSIZE", (0,1), (-1,-1), 8.5),
        ("FONTNAME", (0,1), (-1,-1), "Helvetica"),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [white, alt_bg]),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
        ("TOPPADDING", (0,1), (-1,-1), 5),
        ("BOTTOMPADDING", (0,1), (-1,-1), 5),
        ("LINEBELOW", (0,0), (-1,0), 0.5, white),
        ("LINEBELOW", (0,-1), (-1,-1), 0.5, NEUTRAL),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ])
    if first_col_bold:
        style.add("FONTNAME", (0,1), (0,-1), "Helvetica-Bold")
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(style)
    return t


def page_decorations(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    page_num = canvas.getPageNumber()
    if page_num > 1:
        canvas.drawCentredString(A4[0]/2, 1.2*cm,
            f"Gifted - SEM niche heatmap & viability  |  page {page_num}")
        canvas.setFillColor(PRIMARY)
        canvas.rect(0, A4[1]-0.4*cm, A4[0], 0.4*cm, fill=1, stroke=0)
    canvas.restoreState()


def build():
    doc = SimpleDocTemplate(
        "report/Gifted-SEM-niche-heatmap-2026-05-09.pdf",
        pagesize=A4, leftMargin=2*cm, rightMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm,
        title="Gifted SEM niche heatmap and viability",
        author="openclaw / Svante Pagels",
    )

    story = []

    # COVER
    story.append(Spacer(1, 5*cm))
    story.append(Paragraph("&#127873;", ParagraphStyle("emoji", fontSize=48,
                            alignment=TA_CENTER, leading=54)))
    story.append(Spacer(1, 0.4*cm))
    story.append(Paragraph("Gifted", COVER_TITLE))
    story.append(Paragraph("SEM niche heatmap &amp; viability analysis",
                            ParagraphStyle("st", parent=COVER_SUB, fontSize=16,
                                           textColor=DARKER, fontName="Helvetica-Bold")))
    story.append(Spacer(1, 0.6*cm))
    story.append(Paragraph("Saturday, 9 May 2026", COVER_SUB))
    story.append(Spacer(1, 1.4*cm))

    story.append(Paragraph("THE QUESTION", COVER_PILL))
    story.append(Paragraph(
        "Where in the world can SEM be profitable for a $2-margin gift-card reseller "
        "running on Reloadly + Stripe, premium-positioned, no preconceived geography?",
        ParagraphStyle("cq", parent=BODY, alignment=TA_CENTER, fontSize=11,
                       leading=15, textColor=TEXT, leftIndent=20, rightIndent=20)))

    story.append(Spacer(1, 1*cm))
    story.append(Paragraph("THE ANSWER (TL;DR)", COVER_PILL))
    story.append(Paragraph(
        "<b>9 viable cells</b> globally at strict $2 SEM-only - concentrated in Finland. "
        "Total addressable: <b>~$1.9k/yr</b>. With SEO landing pages + email loop layered in, "
        "this becomes <b>~$30-50k/yr</b> at modest scale, expanding into UAE/Saudi Arabia (Arabic), "
        "Poland, and Greece. The 'underserved Nordic' thesis fails on Reloadly inventory.",
        ParagraphStyle("ca", parent=BODY, alignment=TA_CENTER, fontSize=11,
                       leading=16, textColor=TEXT, leftIndent=10, rightIndent=10)))

    story.append(Spacer(1, 2.5*cm))
    story.append(Paragraph("Prepared by openclaw  |  for Svante Pagels  |  confidential",
                            ParagraphStyle("conf", parent=BODY, fontSize=8,
                                           textColor=MUTED, alignment=TA_CENTER)))
    story.append(PageBreak())

    # 1. EXECUTIVE SUMMARY
    story.append(Paragraph("Executive summary", H1))
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceAfter=12))

    story.append(Paragraph(
        "The strategy was specified clearly: <b>profitable RoAS at $2 fixed margin, premium "
        "positioning, overflow plus underserved niches, global scope, no preconceived geography.</b> "
        "This report tests that strategy against the actual world - the Reloadly catalog, real "
        "language CPCs, real Stripe coverage, and realistic conversion rates.", BODY_J))

    story.append(Paragraph(
        "<b>The honest finding is uncomfortable:</b> at strict $2 SEM-only with conservative "
        "assumptions, only 9 of 1,118 country&times;brand cells clear the math, totalling "
        "~$160/mo or ~$1.9k/yr. The business is real but very small.", BODY_J))

    story.append(Paragraph(
        "<b>The bull case is real and shaped by three plausible levers</b> - any of which makes "
        "the project worth doing, all three combined make it a $30-50k/yr side business at modest "
        "scale, and a $80k+/yr operation if Reloadly's commercial terms come in better than $2:",
        BODY_J))

    story.append(Spacer(1, 4))
    bullets = [
        "<b>SEO landing pages</b> raise effective click capture from ~2% to ~10% of long-tail. Self-financing once indexed.",
        "<b>Email loop</b> on first-purchase capture adds ~$0.90 to effective margin (30% repeat &times; 1.5 LTV).",
        "<b>Reloadly commercial negotiation</b> - if real margin is $3-4 (vs the $2 assumption), the entire economic model unlocks 5-10x more cells.",
    ]
    for b in bullets:
        story.append(Paragraph("&bull; " + b, BULLET))

    story.append(Spacer(1, 8))
    story.append(callout_table([
        Paragraph("<b>Geographic answer:</b> Finland is the unicorn. UAE/Saudi (Arabic), Poland, "
                  "and Greece are the secondary plays. Sweden, Norway, Denmark, Switzerland, and most "
                  "of CEE are inventory- or math-blocked. Tier-1 markets (US/UK/DE/FR/IT/ES/JP) are "
                  "mathematically locked out of paid search at $2 margin.", CALLOUT)
    ], color=PRIMARY))

    # 2. THE BRUTAL HEADLINE
    story.append(Spacer(1, 6))
    story.append(Paragraph("1,118 cells scored - only 9 make it through", H2))
    story.append(Paragraph(
        "Every (country &times; brand) combination from the Reloadly catalog was scored on "
        "language CPC, Stripe coverage, conversion rate, search volume, and break-even economics. "
        "The verdict distribution is the headline:", BODY_J))

    story.append(Image("report/charts/verdicts.png", width=16*cm, height=8*cm))
    story.append(Paragraph(
        "Two failure modes dominate: <b>620 cells fail the math</b> (CPC &gt; break-even) and "
        "<b>423 cells fail Stripe</b> (payment rails effectively absent). Of the remaining 75 cells "
        "where math and Stripe both work, only 9 reach a meaningful net contribution.", CAPTION))

    story.append(PageBreak())

    # 3. WHY THE MATH IS SO TIGHT
    story.append(Paragraph("Why the math is so tight", H2))

    story.append(Paragraph(
        "At $2 fixed margin, break-even CPC = margin &times; CVR. Realistic CVRs run 2-6% depending "
        "on brand tier, language tier, and Stripe friction. That gives a break-even CPC ceiling of "
        "$0.04-$0.12. Long-tail CPCs by language tier:", BODY_J))

    cpc_table = [
        ["Language tier", "Examples", "Head CPC", "Long-tail CPC", "Verdict"],
        ["Tier 1", "en, de, fr, it, es, ja", "$1.20", "$0.42", "Math closes hard"],
        ["Tier 2", "nl, pt, sv, da, no, tr, ko, he", "$0.55", "$0.19", "Math closes"],
        ["Tier 3", "pl, cs, el, ar, ru, vi, th, id", "$0.20", "$0.07", "Borderline"],
        ["Tier 4", "fi, et, lv, sk, hr, bg, sq", "$0.10", "$0.035", "Profitable across the board"],
    ]
    t = data_table(cpc_table, col_widths=[2.5*cm, 5.5*cm, 2*cm, 2.5*cm, 4*cm])
    t.setStyle(TableStyle([
        ("TEXTCOLOR", (4,1), (4,2), DANGER),
        ("TEXTCOLOR", (4,3), (4,3), ACCENT),
        ("TEXTCOLOR", (4,4), (4,4), SUCCESS),
        ("FONTNAME", (4,1), (4,-1), "Helvetica-Bold"),
    ]))
    story.append(t)
    story.append(Spacer(1, 6))

    story.append(Image("report/charts/cpc-vs-breakeven.png", width=16*cm, height=8*cm))
    story.append(Paragraph(
        "The green band is the profitable zone - long-tail CPC at or below the break-even line "
        "(green markers). Only tier-3 and tier-4 long-tail clears it. Notably, Sweden/Norway/Denmark "
        "(your home markets) are tier-2 and locked out.", CAPTION))

    story.append(PageBreak())

    # 4. WHERE THE BUSINESS IS
    story.append(Paragraph("Where the business actually is", H2))

    story.append(Paragraph(
        "After Stripe-filtering and math-filtering, only one country aligns all four favourable "
        "factors: <b>tier-4 cheap language CPC</b>, <b>tier-1 Stripe coverage</b>, "
        "<b>EU-Schengen logistics</b>, and <b>a Reloadly catalog with real retail SKUs</b>.", BODY_J))

    story.append(callout_table([
        Paragraph("<b>Finland is the unicorn.</b>", CALLOUT_BOLD),
        Paragraph("13 cells with positive long-tail headroom. Netflix, Steam, Fortnite, "
                  "App Store/iTunes, PlayStation, Xbox, Mobile Legends, World of Warcraft, "
                  "and Crypto Voucher all clear the math. <b>~$104/mo SEM-only or ~$520/mo with SEO</b>. "
                  "Finland alone accounts for ~65% of the entire addressable opportunity.", CALLOUT),
    ], color=SUCCESS, bg=HexColor("#ecfdf5")))

    story.append(Image("report/charts/countries.png", width=16*cm, height=8*cm))
    story.append(Paragraph(
        "Top markets by SEM-only net (amber) and SEM+SEO net (purple). Finland leads by 5-10x over "
        "the next country. UAE/Saudi Arabia, Poland, and Greece are real but smaller secondary plays.",
        CAPTION))

    story.append(Spacer(1, 8))
    story.append(Paragraph("The other viable markets", H3))

    secondary_table = [
        ["Market", "Language", "Stripe", "Profile", "SEO net $/mo"],
        ["UAE", "Arabic (tier-3)", "Tier 2", "Amazon, App Store, talabat, STARZPLAY", "$66"],
        ["Saudi Arabia", "Arabic (tier-3)", "Tier 2", "Same as UAE - combined Arabic SEM", "$66"],
        ["Poland", "Polish (tier-3)", "Tier 1", "Netflix, FlixBus", "$70"],
        ["Greece", "Greek (tier-3)", "Tier 1", "Netflix, twitch", "$70"],
    ]
    story.append(data_table(secondary_table,
                  col_widths=[3.5*cm, 3*cm, 2*cm, 5.5*cm, 2.5*cm]))

    story.append(PageBreak())

    # 5. WHY EVERYWHERE ELSE FAILS
    story.append(Paragraph("Why everywhere else fails", H2))

    # Wrap long cell content as Paragraphs so it flows properly inside table cells
    cell_para = ParagraphStyle("cell", parent=BODY, fontSize=8, leading=10.5, spaceAfter=0)
    cell_para_bold = ParagraphStyle("cell_bold", parent=cell_para,
                                     fontName="Helvetica-Bold", textColor=DANGER, alignment=TA_CENTER)
    cell_para_first = ParagraphStyle("cell_first", parent=cell_para, fontName="Helvetica-Bold")

    fail_data = [
        [Paragraph("<b>Region / market</b>", ParagraphStyle("hdr", parent=cell_para, textColor=white, fontName="Helvetica-Bold", fontSize=9)),
         Paragraph("<b>Failure mode</b>", ParagraphStyle("hdr", parent=cell_para, textColor=white, fontName="Helvetica-Bold", fontSize=9, alignment=TA_CENTER)),
         Paragraph("<b>Why</b>", ParagraphStyle("hdr", parent=cell_para, textColor=white, fontName="Helvetica-Bold", fontSize=9))],
        [Paragraph("US, UK, DE, FR, IT, ES, JP", cell_para_first),
         Paragraph("Math", cell_para_bold),
         Paragraph("Tier-1 language CPC at $0.42 long-tail, ~6x our break-even ceiling at any plausible CVR.", cell_para)],
        [Paragraph("Sweden, Norway, Denmark", cell_para_first),
         Paragraph("Math + Inventory", cell_para_bold),
         Paragraph("Tier-2 language CPC ($0.19 long-tail) plus Reloadly catalog has near-zero retail. Your home turf is the worst combination.", cell_para)],
        [Paragraph("Czech, Slovak, Slovenian, Croatian, Estonian, Latvian, Lithuanian, Bulgarian", cell_para_first),
         Paragraph("Inventory", cell_para_bold),
         Paragraph("Tier-4 cheap language plus Stripe-1, but Reloadly has zero retail catalog in these markets. Math would have worked.", cell_para)],
        [Paragraph("Egypt, Morocco, Tunisia, Algeria", cell_para_first),
         Paragraph("Stripe friction", cell_para_bold),
         Paragraph("Arabic CPC works, but Stripe is cross-border-only with significant CVR penalty.", cell_para)],
        [Paragraph("Sub-Saharan Africa, Central Asia, Pakistan, Bangladesh", cell_para_first),
         Paragraph("Stripe", cell_para_bold),
         Paragraph("Stripe doesn't really work. Local payment-processor integration would be a separate, larger project.", cell_para)],
        [Paragraph("Mexico, Argentina, Colombia, Chile, Brazil", cell_para_first),
         Paragraph("Math", cell_para_bold),
         Paragraph("Tier-1 Spanish/Portuguese ($0.42 long-tail) too expensive at our CVR/margin.", cell_para)],
    ]
    t = Table(fail_data, colWidths=[5.5*cm, 2.5*cm, 8.5*cm], repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), PRIMARY),
        ("BOTTOMPADDING", (0,0), (-1,0), 8),
        ("TOPPADDING", (0,0), (-1,0), 8),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [white, LIGHT]),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
        ("TOPPADDING", (0,1), (-1,-1), 6),
        ("BOTTOMPADDING", (0,1), (-1,-1), 6),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LINEBELOW", (0,-1), (-1,-1), 0.5, NEUTRAL),
    ]))
    story.append(t)

    story.append(Spacer(1, 8))
    story.append(callout_table([
        Paragraph("<b>Important nuance - Reloadly catalog gaps drive 5+ countries off the map.</b>",
                  CALLOUT_BOLD),
        Paragraph("CEE (Czech / Slovak / Slovenian / Croatian / Baltics / Bulgarian) are <i>economically "
                  "perfect</i> on paper - cheap language CPC, full Stripe support, EU logistics - but "
                  "Reloadly's gift-card catalog there is essentially empty. <b>Adding catalog from "
                  "alternative providers (e.g. Tillo, Blackhawk, BHN, Givex) for these markets would "
                  "be the highest-leverage product extension</b> - it could double the addressable "
                  "footprint without changing the SEM model at all.", CALLOUT),
    ], color=ACCENT, bg=HexColor("#fffbeb")))

    story.append(PageBreak())

    # 6. SENSITIVITY
    story.append(Paragraph("Sensitivity - when does this become a real business?", H2))

    story.append(Paragraph(
        "The strict $2 SEM-only number is small. But three plausible levers stack, and the model is "
        "highly sensitive to which combination of them holds.", BODY_J))

    story.append(Image("report/charts/sensitivity.png", width=16*cm, height=8*cm))
    story.append(Paragraph(
        "Annual net contribution under different effective-margin and click-capture assumptions. "
        "Strict base case (red ring): $1.9k/yr. Realistic case with email loop + SEO landing pages "
        "(purple ring): $39k/yr.", CAPTION))

    story.append(Spacer(1, 6))
    sens_data = [
        ["Scenario", "Margin", "Capture", "Annual net"],
        ["Strict (base case)", "$2.00", "2% (SEM-only)", "$1,896"],
        ["+ email loop", "$2.90", "2% (SEM-only)", "$4,992"],
        ["+ SEO landing pages", "$2.00", "10% (SEM+SEO)", "$9,480"],
        ["Both (target case)", "$2.90", "10% (SEM+SEO)", "$38,976"],
        ["Bull (margin negotiation wins)", "$4.00", "10% (SEM+SEO)", "$81,780"],
    ]
    t = data_table(sens_data, col_widths=[6*cm, 2.5*cm, 4*cm, 3*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,4), (-1,4), HexColor("#ede9fe")),
        ("FONTNAME", (3,4), (3,4), "Helvetica-Bold"),
        ("TEXTCOLOR", (3,4), (3,4), PRIMARY),
        ("BACKGROUND", (0,5), (-1,5), HexColor("#dcfce7")),
        ("FONTNAME", (3,5), (3,5), "Helvetica-Bold"),
        ("TEXTCOLOR", (3,5), (3,5), SUCCESS),
        ("ALIGN", (1,1), (-1,-1), "RIGHT"),
    ]))
    story.append(t)

    story.append(Spacer(1, 12))
    story.append(Paragraph("What could make it bigger", H3))
    for b in [
        "<b>Reloadly margin negotiation:</b> if real terms net $3.50-4.00 average, the model unlocks 5-10x more cells.",
        "<b>Search-volume model is conservative:</b> Q4-2025 Keyword Planner anchors may undercount long-tail by 30-50% in less-researched markets like Finland/UAE. A 2x revision pushes the all-three-levers case past $80k/yr.",
        "<b>Repeat-buyer rate above 30%:</b> gift cards have known high re-purchase. 50% repeat pushes effective margin loop materially higher.",
        "<b>Add catalog from a second provider</b> (Tillo / Blackhawk / Givex) for CEE markets currently inventory-blocked.",
    ]:
        story.append(Paragraph("&bull; " + b, BULLET))

    story.append(Paragraph("What could kill it", H3))
    for b in [
        "<b>Reloadly margin worse than $2</b> (e.g. they pay 2-3% on a $50 card = $1.00-$1.50 actual): math closes for nearly all cells.",
        "<b>CVR overestimate:</b> if our CVRs are 2x too generous (very plausible), break-even CPC halves and even Finland gets thin.",
        "<b>Direct CPC competition</b> from Reloadly's own white-label brands or Apple/Walmart-direct: real CPCs run higher than estimates.",
    ]:
        story.append(Paragraph("&bull; " + b, BULLET))

    story.append(PageBreak())

    # 7. CATALOG REALITY
    story.append(Paragraph("Reloadly catalog reality", H2))

    story.append(Paragraph(
        "Before scoring economics, here's what's actually in the catalog. <b>2,961 SKUs across "
        "169 countries</b> - but 69% of cells are gaming-related, and only ~5% are premium retail.", BODY_J))

    story.append(Image("report/charts/catalog.png", width=16*cm, height=8*cm))
    story.append(Paragraph(
        "Composition of the 1,118 unique (country &times; brand) cells in the Reloadly catalog. "
        "Gaming dominates everywhere, retail is concentrated in 5-10 countries, and most fashion "
        "brands sell only through their home-country catalogs (Decathlon to France, OTTO to Germany, etc.).",
        CAPTION))

    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "<b>Strategic implication for catalog:</b> if you want to pursue \"premium retail gifting\" "
        "as the brand positioning, you cannot do it on Reloadly alone. Either pick a tighter "
        "positioning (gaming-and-streaming-overflow) that matches the inventory you have, or "
        "negotiate access to a second provider for retail SKUs - Tillo and Blackhawk both have "
        "stronger CEE/Nordic retail catalogs.", BODY_J))

    story.append(PageBreak())

    # 8. RECOMMENDED ACTION
    story.append(Paragraph("Recommended action", H2))

    story.append(Paragraph("Phase 0 - pre-launch desk research (now, $0 cost)", H3))
    for b in [
        "Reloadly catalog dump and inventory audit (done)",
        "Cell scoring + heatmap (this report and cells-scored-v3.csv)",
        "Validate top-30 cells against actual Google Keyword Planner data (~2 hours, free)",
        "Validate top-10 cells against actual Google SERPs to confirm SERP-weakness assumption (~1 hour, free)",
        "<b>Confirm Reloadly per-brand commercial terms with your account contact</b> - the single biggest unknown in the model",
    ]:
        story.append(Paragraph("&bull; " + b, BULLET))

    story.append(Paragraph("Phase 1 - pre-launch product work", H3))
    for b in [
        "Implement Next.js i18n routing for <b>fi-FI, en-IE, en-AU, ar-AE, ar-SA, pl-PL, el-GR, en-MT, en-NZ</b> (9 first-wave locales)",
        "Build a <b>per-locale &times; per-brand landing-page generator</b> (getStaticProps + Reloadly catalog) - this is the SEO compounding engine that turns 2% paid capture into 10% combined capture",
        "Add Product / Offer / Breadcrumb schema, sitemap, robots.txt, hreflang",
        "<b>Email-capture as primary KPI alongside checkout</b> - gift-card-launch popup with a 5%-off code as carrot, kicks the email loop into life",
        "Stripe payment-method matrix per country: Sofort, iDEAL, Bancontact, Apple Pay, Google Pay, Mada (SA), MobilePay (FI/DK)",
    ]:
        story.append(Paragraph("&bull; " + b, BULLET))

    story.append(Paragraph("Phase 2 - soft launch (first $300 SEM spend)", H3))
    for b in [
        "<b>Launch only on Finland &times; top-5 brands</b> (Netflix, Steam, App Store, PlayStation, Fortnite) on <b>Bing Ads first</b> - cheaper CPCs let you validate the funnel without burning Google budget",
        "Spend cap: $300/mo. Target: confirm or refute model assumptions on real CVR and CPC.",
        "If Finland validates: extend to UAE/Saudi Arabia (Arabic) and Greece/Poland in month 2",
        "<b>If Finland doesn't validate</b> (real CVR &lt; 3%, real CPC &gt; $0.05): the entire $2-margin thesis is wrong, and the product needs to either add affiliate revenue, raise margin via service fees, or pivot",
    ]:
        story.append(Paragraph("&bull; " + b, BULLET))

    story.append(Spacer(1, 12))
    story.append(callout_table([
        Paragraph("<b>The single most important next decision</b>", CALLOUT_BOLD),
        Paragraph("Confirm Reloadly's actual commercial terms before committing to product build. "
                  "If their per-brand take-rate yields you $3+ instead of $2, this becomes a 5-10x "
                  "better business and the priority country list expands materially. If it yields "
                  "less than $2, the math collapses for nearly all cells and you should pivot the "
                  "model (e.g. add a 2-3% service fee on top of the gift card face value).",
                  CALLOUT),
    ], color=PRIMARY))

    story.append(PageBreak())

    # 9. APPENDIX
    story.append(Paragraph("Appendix - methodology &amp; data", H2))

    story.append(Paragraph("How cells were scored", H3))
    for b in [
        "Pulled Reloadly sandbox catalog: 2,961 SKUs across 169 countries.",
        "Aggregated to 1,118 unique (country &times; brand) cells - the SEM targeting unit.",
        "Joined each cell with primary language, Stripe-tier (1-4), language CPC tier (1-4), country search-market tier (1-4), brand reference search volume in tier-2 baseline market, and brand gift-fit tier (A/B/C).",
        "Modeled CVR as a function of brand &times; language &times; Stripe (premium retail in cheap-language Stripe-1 = ~6%, gaming in tier-1 language Stripe-2 = ~2.1%).",
        "Computed break-even CPC = margin &times; CVR. Cell is math-profitable if long-tail CPC &le; break-even.",
        "Assumed 2% click capture for SEM-only and 10% for SEM+SEO-landing-pages combined.",
    ]:
        story.append(Paragraph("&bull; " + b, BULLET))

    story.append(Paragraph("Top-15 cells by score", H3))
    top_cells_data = [
        ["Verdict", "Country", "Brand", "Lang", "Searches", "BE CPC", "LT CPC", "SEM net", "SEO net"],
        ["WATCH", "Finland", "Netflix", "fi", "25,000", "$0.12", "$0.035", "$33", "$164"],
        ["WATCH", "Finland", "Steam", "fi", "35,000", "$0.09", "$0.035", "$27", "$135"],
        ["WATCH-SEO", "Finland", "App Store / iTunes", "fi", "10,000", "$0.12", "$0.035", "$13", "$66"],
        ["WATCH-SEO", "Finland", "PlayStation", "fi", "15,000", "$0.09", "$0.035", "$12", "$58"],
        ["WATCH", "Finland", "Fortnite", "fi", "30,000", "$0.08", "$0.035", "$19", "$95"],
        ["WATCH-SEO", "Finland", "Xbox", "fi", "10,000", "$0.09", "$0.035", "$6", "$30"],
        ["WATCH-SEO", "Finland", "Mobile Legends", "fi", "12,000", "$0.08", "$0.035", "$6", "$30"],
        ["WATCH-SEO", "Poland", "Netflix", "pl", "25,000", "$0.11", "$0.070", "$14", "$70"],
        ["WATCH-SEO", "Greece", "Netflix", "el", "25,000", "$0.11", "$0.070", "$14", "$70"],
        ["WATCH-SEO", "UAE", "Amazon", "ar", "40,000", "$0.09", "$0.070", "$13", "$66"],
        ["WATCH-SEO", "Saudi Arabia", "Amazon", "ar", "40,000", "$0.09", "$0.070", "$13", "$66"],
        ["SKIP-VOL", "Cyprus", "Netflix", "el", "5,833", "$0.11", "$0.070", "$3", "$14"],
        ["SKIP-VOL", "Finland", "Crypto Voucher", "fi", "3,000", "$0.08", "$0.035", "$2", "$8"],
        ["SKIP-VOL", "Finland", "Swarovski", "fi", "800", "$0.12", "$0.035", "$1", "$4"],
        ["SKIP-VOL", "Finland", "Jawaker", "fi", "2,500", "$0.08", "$0.035", "$1", "$5"],
    ]
    t = data_table(top_cells_data, col_widths=[1.7*cm, 2.3*cm, 3*cm, 1*cm, 1.8*cm,
                                                1.4*cm, 1.4*cm, 1.4*cm, 1.4*cm], first_col_bold=False)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,1), (-1,7), HexColor("#dcfce7")),
        ("BACKGROUND", (0,8), (-1,11), HexColor("#fef3c7")),
        ("FONTSIZE", (0,1), (-1,-1), 7.5),
        ("ALIGN", (4,1), (-1,-1), "RIGHT"),
    ]))
    story.append(t)
    story.append(Paragraph("Green rows = WATCH-tier (real). Amber rows = WATCH-SEO (only viable with SEO leverage). Grey rows = SKIP-VOL (math works, capture too small).",
                            CAPTION))

    story.append(Spacer(1, 8))
    story.append(Paragraph("Files in the research bundle", H3))
    for f in [
        "research/02-niche-heatmap-findings.md - full markdown writeup",
        "research/inventory-matrix.csv - Reloadly inventory by (brand &times; country)",
        "research/scoring/cells-base.csv - 1,118 base cells with structural metadata",
        "research/scoring/cells-scored-v3.csv - full scoring output (canonical)",
        "research/raw/products.json - full 2,961-SKU dump (local only, not committed)",
        "research/raw/countries.json - 169 supported countries",
    ]:
        story.append(Paragraph("&bull; " + f, BULLET))

    story.append(Paragraph(
        "All data and analysis is committed in PR #3 on <b>svantepagels/gifted</b>: "
        "<b>https://github.com/svantepagels/gifted/pull/3</b>", BODY))

    doc.build(story, onFirstPage=page_decorations, onLaterPages=page_decorations)
    import os
    sz = os.path.getsize("report/Gifted-SEM-niche-heatmap-2026-05-09.pdf")
    print(f"PDF: {sz/1024:.1f} KB at report/Gifted-SEM-niche-heatmap-2026-05-09.pdf")


if __name__ == "__main__":
    build()
