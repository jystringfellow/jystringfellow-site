'use client';

import React, { useEffect, useRef, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import EmailIcon from '@mui/icons-material/Email';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import IconButton from '@mui/material/IconButton';
import {
  Turnstile,
  type TurnstileInstance,
} from '@marsidev/react-turnstile';

const EMAIL = 'contact@jystringfellow.com';
const GITHUB_URL = 'https://github.com/jystringfellow';
const LINKEDIN_URL = 'https://www.linkedin.com/in/jacob-y-stringfellow/';
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
const MAX_MESSAGE_LENGTH = 2000;
const SUCCESS_BANNER_TIMEOUT_MS = 5000;

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    website: '',
  });
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
      setSubmitError(null);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (submitStatus !== 'success') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSubmitStatus('idle');
    }, SUCCESS_BANNER_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [submitStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('idle');
    setSubmitError(null);

    if (!TURNSTILE_SITE_KEY) {
      setSubmitStatus('error');
      setSubmitError('Contact form verification is not configured yet.');
      return;
    }

    if (!turnstileToken) {
      setSubmitStatus('error');
      setSubmitError('Please complete the verification challenge before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, turnstileToken }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '', website: '' });
        setTurnstileToken(null);
        turnstileRef.current?.reset();
      } else {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setSubmitStatus('error');
        setSubmitError(data?.error || 'Something went wrong. Please try again later.');
        setTurnstileToken(null);
        turnstileRef.current?.reset();
      }
    } catch {
      setSubmitStatus('error');
      setSubmitError('Something went wrong. Please try again later.');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Get in Touch
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Have a question or want to work together? I&apos;d love to hear from
          you!
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Send Me a Message
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Message"
                  name="message"
                  multiline
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  margin="normal"
                  inputProps={{ maxLength: MAX_MESSAGE_LENGTH }}
                  helperText={`${formData.message.length}/${MAX_MESSAGE_LENGTH}`}
                />
                <TextField
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  autoComplete="off"
                  tabIndex={-1}
                  aria-hidden="true"
                  sx={{
                    position: 'absolute',
                    left: '-10000px',
                    width: 1,
                    height: 1,
                    overflow: 'hidden',
                  }}
                />
                {submitStatus === 'success' && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Message sent successfully! I&apos;ll get back to you soon.
                  </Alert>
                )}
                {submitStatus === 'error' && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {submitError || 'Something went wrong. Please try again later.'}
                  </Alert>
                )}
                <Box sx={{ mt: 3 }}>
                  {TURNSTILE_SITE_KEY ? (
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={TURNSTILE_SITE_KEY}
                      onSuccess={setTurnstileToken}
                      onExpire={() => setTurnstileToken(null)}
                      onError={() => setTurnstileToken(null)}
                    />
                  ) : (
                    <Alert severity="warning">
                      Contact form verification is unavailable until
                      `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is configured.
                    </Alert>
                  )}
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!turnstileToken || isSubmitting || !TURNSTILE_SITE_KEY}
                  sx={{ mt: 2 }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Connect With Me
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconButton
                    color="primary"
                    aria-label="email"
                    href={`mailto:${EMAIL}`}
                  >
                    <EmailIcon />
                  </IconButton>
                  <Typography
                    variant="body1"
                    component="a"
                    href={`mailto:${EMAIL}`}
                    sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {EMAIL}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconButton
                    color="primary"
                    aria-label="github"
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener"
                  >
                    <GitHubIcon />
                  </IconButton>
                  <Typography
                    variant="body1"
                    component="a"
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener"
                    sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    GitHub
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    color="primary"
                    aria-label="linkedin"
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener"
                  >
                    <LinkedInIcon />
                  </IconButton>
                  <Typography
                    variant="body1"
                    component="a"
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener"
                    sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    LinkedIn
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
