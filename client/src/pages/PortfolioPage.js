import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Fab,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Menu as MenuIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  Launch as LaunchIcon,
  KeyboardArrowUp as UpIcon,
} from '@mui/icons-material';
import {
  profile,
  skills,
  experience,
  projects,
  education,
  navSections,
} from '../data/resumeData';

const ACCENT = '#0d9488';
const ACCENT_DARK = '#0f766e';
const BG_DARK = '#0f172a';
const BG_CARD = '#1e293b';
const TEXT_MUTED = '#94a3b8';

const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const SectionHeading = ({ children }) => (
  <Typography
    variant="h5"
    fontWeight={700}
    sx={{ mb: 3, color: '#f8fafc', letterSpacing: '-0.02em' }}
  >
    {children}
    <Box
      component="span"
      sx={{
        display: 'block',
        width: 48,
        height: 3,
        bgcolor: ACCENT,
        borderRadius: 2,
        mt: 1,
      }}
    />
  </Typography>
);

const PrintResume = () => (
  <Box className="print-resume" sx={{ display: 'none' }}>
    <Typography variant="h4" fontWeight="bold" gutterBottom>
      {profile.name}
    </Typography>
    <Typography variant="subtitle1" gutterBottom>
      {profile.title} · {profile.location}
    </Typography>
    <Typography variant="body2" gutterBottom>
      {profile.email} · {profile.phone}
    </Typography>
    <Divider sx={{ my: 2 }} />

    <Typography variant="h6" fontWeight="bold" gutterBottom>
      Summary
    </Typography>
    <Typography variant="body2" paragraph>
      {profile.summary}
    </Typography>

    <Typography variant="h6" fontWeight="bold" gutterBottom>
      Skills
    </Typography>
    {skills.map((group) => (
      <Typography key={group.category} variant="body2" paragraph>
        <strong>{group.category}:</strong> {group.items.join(', ')}
      </Typography>
    ))}

    <Typography variant="h6" fontWeight="bold" gutterBottom>
      Experience
    </Typography>
    {experience.map((job) => (
      <Box key={job.company + job.role} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold">
          {job.role} — {job.company} ({job.period})
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
          {job.highlights.map((item) => (
            <Typography component="li" variant="body2" key={item}>
              {item}
            </Typography>
          ))}
        </Box>
      </Box>
    ))}

    <Typography variant="h6" fontWeight="bold" gutterBottom>
      Projects
    </Typography>
    {projects.map((project) => (
      <Box key={project.name} sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight="bold">
          {project.name}
        </Typography>
        <Typography variant="body2">{project.description}</Typography>
        <Typography variant="caption">Tech: {project.tech.join(', ')}</Typography>
      </Box>
    ))}

    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
      Education
    </Typography>
    {education.map((edu) => (
      <Box key={edu.school} sx={{ mb: 1 }}>
        <Typography variant="subtitle2" fontWeight="bold">
          {edu.degree}
        </Typography>
        <Typography variant="body2">
          {edu.school} · {edu.period}
        </Typography>
        <Typography variant="body2">{edu.detail}</Typography>
      </Box>
    ))}
  </Box>
);

const PortfolioPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      const offset = 120;
      let current = navSections[0]?.id || 'about';
      for (const section of navSections) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= offset) {
          current = section.id;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handlePrint = () => window.print();

  const navButton = (section) => (
    <ListItemButton
      key={section.id}
      selected={activeSection === section.id}
      onClick={() => {
        scrollTo(section.id);
        setDrawerOpen(false);
      }}
      sx={{
        borderRadius: 2,
        mb: 0.5,
        color: activeSection === section.id ? ACCENT : TEXT_MUTED,
        '&.Mui-selected': {
          bgcolor: 'rgba(13, 148, 136, 0.12)',
          '&:hover': { bgcolor: 'rgba(13, 148, 136, 0.18)' },
        },
      }}
    >
      <ListItemText
        primary={section.label}
        primaryTypographyProps={{ fontWeight: activeSection === section.id ? 700 : 500, fontSize: '0.95rem' }}
      />
    </ListItemButton>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: BG_DARK, color: '#f8fafc' }}>
      <PrintResume />

      {/* Top bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
        }}
      >
        <Toolbar sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
          <IconButton color="inherit" onClick={() => navigate('/')} edge="start" aria-label="Back to home">
            <BackIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1, ml: 1 }}>
            Resume
          </Typography>
          <Button
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              color: ACCENT,
              textTransform: 'none',
              fontWeight: 600,
              display: { xs: 'none', sm: 'flex' },
            }}
          >
            Print / PDF
          </Button>
          {isMobile && (
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)} edge="end">
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { bgcolor: BG_CARD, color: '#f8fafc', width: 260 } }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" color={TEXT_MUTED} gutterBottom>
            Jump to
          </Typography>
          <List disablePadding>{navSections.map(navButton)}</List>
          <Divider sx={{ my: 2, borderColor: 'rgba(148,163,184,0.2)' }} />
          <Button fullWidth startIcon={<PrintIcon />} onClick={handlePrint}
            sx={{ color: ACCENT, textTransform: 'none', fontWeight: 600 }}>
            Print / PDF
          </Button>
        </Box>
      </Drawer>

      <Toolbar />

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Grid container spacing={4}>
          {/* Sidebar — desktop */}
          {!isMobile && (
            <Grid item md={3}>
              <Box sx={{ position: 'sticky', top: 88 }}>
                <List disablePadding>{navSections.map(navButton)}</List>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  sx={{
                    mt: 2,
                    bgcolor: ACCENT,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { bgcolor: ACCENT_DARK },
                  }}
                >
                  Download Resume
                </Button>
              </Box>
            </Grid>
          )}

          <Grid item xs={12} md={9}>
            {/* Hero */}
            <Box
              sx={{
                mb: 6,
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                background: `linear-gradient(135deg, ${BG_CARD} 0%, #334155 100%)`,
                border: '1px solid rgba(148, 163, 184, 0.15)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -40,
                  right: -40,
                  width: 180,
                  height: 180,
                  borderRadius: '50%',
                  bgcolor: 'rgba(13, 148, 136, 0.15)',
                }}
              />
              <Typography
                variant="overline"
                sx={{ color: ACCENT, fontWeight: 700, letterSpacing: 2 }}
              >
                Portfolio & Resume
              </Typography>
              <Typography
                variant="h3"
                fontWeight={800}
                sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, letterSpacing: '-0.03em', mt: 1 }}
              >
                {profile.name}
              </Typography>
              <Typography variant="h6" sx={{ color: ACCENT, fontWeight: 600, mt: 0.5 }}>
                {profile.title}
              </Typography>
              <Typography variant="body1" sx={{ color: TEXT_MUTED, mt: 2, maxWidth: 560, lineHeight: 1.7 }}>
                {profile.tagline}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
                <Chip icon={<EmailIcon />} label={profile.email} size="small"
                  sx={{ bgcolor: 'rgba(15,23,42,0.6)', color: '#e2e8f0' }} />
                <Chip icon={<PhoneIcon />} label={profile.phone} size="small"
                  sx={{ bgcolor: 'rgba(15,23,42,0.6)', color: '#e2e8f0' }} />
                <Chip icon={<LocationIcon />} label={profile.location} size="small"
                  sx={{ bgcolor: 'rgba(15,23,42,0.6)', color: '#e2e8f0' }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
                <Button
                  variant="contained"
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<GitHubIcon />}
                  sx={{ bgcolor: '#334155', textTransform: 'none', '&:hover': { bgcolor: '#475569' } }}
                >
                  GitHub
                </Button>
                <Button
                  variant="contained"
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<LinkedInIcon />}
                  sx={{ bgcolor: ACCENT, textTransform: 'none', '&:hover': { bgcolor: ACCENT_DARK } }}
                >
                  LinkedIn
                </Button>
              </Box>
            </Box>

            {/* About */}
            <Box id="about" sx={{ mb: 6, scrollMarginTop: 100 }}>
              <SectionHeading>About</SectionHeading>
              <Typography variant="body1" sx={{ color: TEXT_MUTED, lineHeight: 1.8, maxWidth: 720 }}>
                {profile.summary}
              </Typography>
            </Box>

            {/* Skills */}
            <Box id="skills" sx={{ mb: 6, scrollMarginTop: 100 }}>
              <SectionHeading>Skills</SectionHeading>
              <Grid container spacing={2}>
                {skills.map((group) => (
                  <Grid item xs={12} sm={6} md={4} key={group.category}>
                    <Box
                      sx={{
                        p: 2.5,
                        height: '100%',
                        borderRadius: 3,
                        bgcolor: BG_CARD,
                        border: '1px solid rgba(148, 163, 184, 0.12)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <CodeIcon sx={{ color: ACCENT, fontSize: 20 }} />
                        <Typography fontWeight={700}>{group.category}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {group.items.map((skill) => (
                          <Chip
                            key={skill}
                            label={skill}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(13, 148, 136, 0.15)',
                              color: '#5eead4',
                              fontWeight: 500,
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Experience */}
            <Box id="experience" sx={{ mb: 6, scrollMarginTop: 100 }}>
              <SectionHeading>Experience</SectionHeading>
              {experience.map((job, index) => (
                <Box
                  key={job.company + job.role}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    mb: index < experience.length - 1 ? 3 : 0,
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: BG_CARD,
                    border: '1px solid rgba(148, 163, 184, 0.12)',
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: 'rgba(13, 148, 136, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <WorkIcon sx={{ color: ACCENT }} />
                  </Box>
                  <Box>
                    <Typography fontWeight={700} variant="subtitle1">
                      {job.role}
                    </Typography>
                    <Typography variant="body2" sx={{ color: ACCENT }}>
                      {job.company} · {job.period}
                    </Typography>
                    <Box component="ul" sx={{ m: 0, mt: 1.5, pl: 2, color: TEXT_MUTED }}>
                      {job.highlights.map((item) => (
                        <Typography component="li" variant="body2" key={item} sx={{ mb: 0.5, lineHeight: 1.7 }}>
                          {item}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Projects */}
            <Box id="projects" sx={{ mb: 6, scrollMarginTop: 100 }}>
              <SectionHeading>Projects</SectionHeading>
              <Grid container spacing={2}>
                {projects.map((project) => (
                  <Grid item xs={12} key={project.name}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: BG_CARD,
                        border: '1px solid rgba(148, 163, 184, 0.12)',
                        transition: 'border-color 0.2s',
                        '&:hover': { borderColor: 'rgba(13, 148, 136, 0.4)' },
                      }}
                    >
                      <Typography fontWeight={700} variant="h6" gutterBottom>
                        {project.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: TEXT_MUTED, mb: 2, lineHeight: 1.7 }}>
                        {project.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: project.link ? 2 : 0 }}>
                        {project.tech.map((t) => (
                          <Chip key={t} label={t} size="small"
                            sx={{ bgcolor: 'rgba(51, 65, 85, 0.8)', color: '#cbd5e1' }} />
                        ))}
                      </Box>
                      {project.link && (
                        <Button
                          size="small"
                          endIcon={<LaunchIcon />}
                          onClick={() => {
                            if (project.link.startsWith('http')) {
                              window.open(project.link, '_blank', 'noopener,noreferrer');
                            } else {
                              navigate(project.link);
                            }
                          }}
                          sx={{ color: ACCENT, textTransform: 'none', fontWeight: 600, p: 0 }}
                        >
                          {project.linkLabel}
                        </Button>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Education */}
            <Box id="education" sx={{ mb: 6, scrollMarginTop: 100 }}>
              <SectionHeading>Education</SectionHeading>
              {education.map((edu) => (
                <Box
                  key={edu.school}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: BG_CARD,
                    border: '1px solid rgba(148, 163, 184, 0.12)',
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: 'rgba(13, 148, 136, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <SchoolIcon sx={{ color: ACCENT }} />
                  </Box>
                  <Box>
                    <Typography fontWeight={700}>{edu.degree}</Typography>
                    <Typography variant="body2" sx={{ color: ACCENT }}>
                      {edu.school} · {edu.period}
                    </Typography>
                    <Typography variant="body2" sx={{ color: TEXT_MUTED, mt: 0.5 }}>
                      {edu.detail}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Contact */}
            <Box
              id="contact"
              sx={{
                scrollMarginTop: 100,
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                textAlign: 'center',
                background: `linear-gradient(135deg, rgba(13,148,136,0.2) 0%, ${BG_CARD} 100%)`,
                border: '1px solid rgba(13, 148, 136, 0.3)',
              }}
            >
              <SectionHeading>Get in Touch</SectionHeading>
              <Typography sx={{ color: TEXT_MUTED, mb: 3, maxWidth: 480, mx: 'auto' }}>
                Open to full-time roles, freelance work, and interesting project collaborations.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  href={`mailto:${profile.email}`}
                  startIcon={<EmailIcon />}
                  sx={{ bgcolor: ACCENT, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: ACCENT_DARK } }}
                >
                  Email Me
                </Button>
                <Button
                  variant="outlined"
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<LinkedInIcon />}
                  sx={{
                    borderColor: ACCENT,
                    color: ACCENT,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { borderColor: ACCENT_DARK, bgcolor: 'rgba(13,148,136,0.08)' },
                  }}
                >
                  Connect on LinkedIn
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {showScrollTop && (
        <Fab
          size="small"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            bgcolor: ACCENT,
            color: '#fff',
            '&:hover': { bgcolor: ACCENT_DARK },
          }}
          aria-label="Scroll to top"
        >
          <UpIcon />
        </Fab>
      )}
    </Box>
  );
};

export default PortfolioPage;
