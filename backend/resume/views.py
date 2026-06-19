import io
from django.http import FileResponse
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable,
    Table, TableStyle, KeepTogether
)
from reportlab.platypus.flowables import Flowable

from accounts.models import Profile
from projects.models import Project
from .models import Certificate, Experience, ResumeTemplate
from .serializers import CertificateSerializer, ExperienceSerializer, ResumeTemplateSerializer

W, H = A4  # 595 x 842 pts

COLOR_MAP = {
    'blue':   '#0969da',
    'green':  '#1a7f37',
    'purple': '#8250df',
    'red':    '#cf222e',
    'orange': '#bc4c00',
    'teal':   '#1b7f79',
    'slate':  '#32383f',
    'rose':   '#b91c1c',
}

def hex_color(h):
    h = h.lstrip('#')
    return colors.Color(int(h[0:2],16)/255, int(h[2:4],16)/255, int(h[4:6],16)/255)


def styles(accent, template):
    dark  = colors.Color(0.1, 0.1, 0.1)
    muted = colors.Color(0.35, 0.35, 0.35)
    white = colors.white

    serif = template == 'academic'
    font  = 'Times-Roman' if serif else 'Helvetica'
    fontB = 'Times-Bold'  if serif else 'Helvetica-Bold'

    name_size = {'compact': 18, 'executive': 19, 'minimal': 20}.get(template, 24)

    return {
        'name':    ParagraphStyle('name',    fontName=fontB,  fontSize=name_size, textColor=dark,  spaceAfter=2,  leading=name_size+4),
        'contact': ParagraphStyle('contact', fontName=font,   fontSize=8.5,      textColor=muted, spaceAfter=2,  leading=12),
        'bio':     ParagraphStyle('bio',     fontName=font,   fontSize=9.5,      textColor=dark,  spaceAfter=4,  leading=14),
        'section': ParagraphStyle('section', fontName=fontB,  fontSize=10,       textColor=accent,spaceAfter=4,  spaceBefore=10, leading=14),
        'job':     ParagraphStyle('job',     fontName=fontB,  fontSize=10,       textColor=dark,  spaceAfter=1,  leading=14),
        'sub':     ParagraphStyle('sub',     fontName=font,   fontSize=9,        textColor=muted, spaceAfter=2,  leading=13),
        'body':    ParagraphStyle('body',    fontName=font,   fontSize=9.5,      textColor=dark,  spaceAfter=3,  leading=14),
        'small':   ParagraphStyle('small',   fontName=font,   fontSize=8.5,      textColor=muted, spaceAfter=2,  leading=12),
        'skill':   ParagraphStyle('skill',   fontName=font,   fontSize=9,        textColor=dark,  spaceAfter=0,  leading=13),
    }


def divider(accent, thick=0.5):
    return HRFlowable(width='100%', thickness=thick, color=accent, spaceAfter=4, spaceBefore=2)


def section_title(text, st, accent, template):
    items = []
    if template == 'modern':
        items.append(Spacer(1, 6))
        items.append(Table(
            [[Paragraph(text.upper(), st['section'])]],
            colWidths=[W - 4*cm],
            style=TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), accent),
                ('TEXTCOLOR',  (0,0), (-1,-1), colors.white),
                ('FONTNAME',   (0,0), (-1,-1), 'Helvetica-Bold'),
                ('FONTSIZE',   (0,0), (-1,-1), 9),
                ('TOPPADDING', (0,0), (-1,-1), 3),
                ('BOTTOMPADDING', (0,0), (-1,-1), 3),
                ('LEFTPADDING',   (0,0), (-1,-1), 6),
            ])
        ))
    elif template == 'minimal':
        items.append(Spacer(1, 8))
        s = ParagraphStyle('ms', fontName='Helvetica', fontSize=9, textColor=colors.Color(0.55,0.55,0.55),
                           spaceAfter=2, leading=13)
        items.append(Paragraph(text.upper(), s))
        items.append(HRFlowable(width='100%', thickness=0.4, color=colors.Color(0.8,0.8,0.8), spaceAfter=4))
    elif template == 'creative':
        items.append(Spacer(1, 6))
        s = ParagraphStyle('cs', fontName='Helvetica-Bold', fontSize=10, textColor=accent, spaceAfter=3, leading=14)
        items.append(Paragraph(text.upper(), s))
        items.append(HRFlowable(width='100%', thickness=1.5, color=accent, spaceAfter=4))
    else:
        items.append(Spacer(1, 6))
        items.append(Paragraph(text.upper(), st['section']))
        items.append(divider(accent))
    return items


def build_classic(story, user, profile, skills, experiences, projects, certs, template, accent, st, show_skills, show_projects, show_certs):
    """Shared builder for classic / tech / executive / compact / academic / minimal / modern / creative"""

    # ── Header ──────────────────────────────────────────────────────────
    contacts = []
    if user.email:              contacts.append(user.email)
    if profile.location:        contacts.append(profile.location)
    if profile.github_username: contacts.append(f'github.com/{profile.github_username}')
    if profile.linkedin_url:    contacts.append(profile.linkedin_url)
    if profile.website:         contacts.append(profile.website)

    edu_line = " · ".join(filter(None, [
        profile.college,
        profile.branch,
        f'Year {profile.year}' if profile.year else None,
    ]))

    if template == 'modern':
        # Coloured header block via table
        name_s = ParagraphStyle('hn', fontName='Helvetica-Bold', fontSize=26, textColor=colors.white, leading=30)
        con_s  = ParagraphStyle('hc', fontName='Helvetica',      fontSize=8.5, textColor=colors.Color(0.9,0.9,0.9), leading=12)
        story.append(Table(
            [[Paragraph(user.username, name_s)],
             [Paragraph('  ·  '.join(contacts), con_s)] if contacts else [Paragraph('', con_s)]],
            colWidths=[W - 4*cm],
            style=TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), accent),
                ('TOPPADDING', (0,0), (-1,-1), 18),
                ('BOTTOMPADDING', (0,0), (-1,-1), 14),
                ('LEFTPADDING',  (0,0), (-1,-1), 16),
                ('RIGHTPADDING', (0,0), (-1,-1), 16),
            ])
        ))
        if profile.bio:
            story.append(Spacer(1, 6))
            story.append(Paragraph(profile.bio, st['bio']))
    elif template == 'creative':
        story.append(Paragraph(user.username, st['name']))
        if contacts:
            story.append(Paragraph('  ·  '.join(contacts), st['contact']))
        if profile.bio:
            story.append(Paragraph(profile.bio, st['bio']))
        story.append(divider(accent, thick=2))
    else:
        story.append(Paragraph(user.username, st['name']))
        if contacts:
            story.append(Paragraph('  ·  '.join(contacts), st['contact']))
        if edu_line and template in ('academic', 'executive'):
            story.append(Paragraph(edu_line, st['contact']))
        if profile.bio:
            story.append(Paragraph(profile.bio, st['bio']))
        story.append(divider(accent, thick=1.5 if template not in ('minimal',) else 0.5))

    # ── Skills ──────────────────────────────────────────────────────────
    if skills and show_skills:
        story.extend(section_title('Skills', st, accent, template))
        story.append(Paragraph(', '.join(skills), st['body']))

    # ── Experience ──────────────────────────────────────────────────────
    if experiences:
        story.extend(section_title('Experience', st, accent, template))
        for e in experiences:
            block = []
            header = Table(
                [[Paragraph(e.role, st['job']), Paragraph(e.duration or '', st['sub'])]],
                colWidths=[9*cm, W - 4*cm - 9*cm],
                style=TableStyle([
                    ('VALIGN',        (0,0),(-1,-1),'TOP'),
                    ('RIGHTPADDING',  (1,0),(1,0), 0),
                    ('LEFTPADDING',   (0,0),(0,0), 0),
                    ('TOPPADDING',    (0,0),(-1,-1), 0),
                    ('BOTTOMPADDING', (0,0),(-1,-1), 0),
                ])
            )
            block.append(header)
            block.append(Paragraph(e.company, st['sub']))
            if e.description:
                block.append(Paragraph(e.description, st['body']))
            block.append(Spacer(1, 4))
            story.append(KeepTogether(block))

    # ── Projects ────────────────────────────────────────────────────────
    if projects and show_projects:
        story.extend(section_title('Projects', st, accent, template))
        for p in projects:
            block = []
            title = p.title
            if p.github_link:
                title += f' <font color="{COLOR_MAP.get("blue","#0969da")}">[github]</font>'
            if p.demo_link:
                title += f' <font color="{COLOR_MAP.get("blue","#0969da")}">[demo]</font>'
            block.append(Paragraph(title, st['job']))
            if p.description:
                block.append(Paragraph(p.description[:300], st['body']))
            if p.tech_stack:
                block.append(Paragraph(f'Stack: {p.tech_stack}', st['small']))
            block.append(Spacer(1, 4))
            story.append(KeepTogether(block))

    # ── Certifications ──────────────────────────────────────────────────
    if certs and show_certs:
        story.extend(section_title('Certifications', st, accent, template))
        for c in certs:
            line = f'{c.title} — {c.issuer}'
            if c.issue_date:
                line += f' · {c.issue_date}'
            story.append(Paragraph(line, st['body']))
            story.append(Spacer(1, 3))

    # ── Education ───────────────────────────────────────────────────────
    story.extend(section_title('Education', st, accent, template))
    story.append(Paragraph(profile.college or '—', st['job']))
    sub_parts = [profile.branch, f'Year {profile.year}' if profile.year else None]
    story.append(Paragraph('  ·  '.join(filter(None, sub_parts)) or '', st['sub']))


class ResumeTemplateView(generics.RetrieveUpdateAPIView):
    serializer_class = ResumeTemplateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj, _ = ResumeTemplate.objects.get_or_create(user=self.request.user, defaults={'template_type': 'classic'})
        return obj

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


class ResumePDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user     = request.user
        profile, _ = Profile.objects.get_or_create(user=user)
        tmpl, _  = ResumeTemplate.objects.get_or_create(user=user)
        experiences = list(Experience.objects.filter(user=user))
        projects    = list(Project.objects.filter(owner=user))
        certs       = list(Certificate.objects.filter(user=user)) if tmpl.show_certifications else []
        skills      = [s.strip() for s in (profile.skills or '').split(',') if s.strip()]

        accent_hex  = COLOR_MAP.get(tmpl.color_scheme, '#0969da')
        accent      = hex_color(accent_hex)
        template    = tmpl.template_type or 'classic'

        margin = 1.5*cm if template == 'compact' else 1.8*cm
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, pagesize=A4,
            rightMargin=margin, leftMargin=margin,
            topMargin=margin, bottomMargin=margin,
            title=f'{user.username} Resume',
            author=user.username,
        )

        st    = styles(accent, template)
        story = []

        build_classic(
            story, user, profile, skills, experiences, projects, certs,
            template, accent, st,
            show_skills=tmpl.show_skills_bar,
            show_projects=tmpl.show_projects,
            show_certs=tmpl.show_certifications,
        )

        doc.build(story)
        buffer.seek(0)
        filename = f'{user.username}_{template}_resume.pdf'
        response = FileResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Expose-Headers'] = 'Content-Disposition'
        return response


class CertificateListView(generics.ListCreateAPIView):
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Certificate.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CertificateDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Certificate.objects.filter(user=self.request.user)


class ExperienceListView(generics.ListCreateAPIView):
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Experience.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ExperienceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Experience.objects.filter(user=self.request.user)
