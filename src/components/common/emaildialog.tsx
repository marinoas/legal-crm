import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Chip,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Autocomplete,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  AttachFileIcon,
  List,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachmentIcon from '@mui/icons-material/Attachment';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables?: string[];
}

interface EmailContact {
  id: string;
  name: string;
  email: string;
  type?: 'client' | 'contact' | 'other';
}

interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

interface EmailDialogProps {
  open: boolean;
  onClose: () => void;
  onSend: (emailData: EmailData) => Promise<void>;
  to?: EmailContact[];
  cc?: EmailContact[];
  bcc?: EmailContact[];
  subject?: string;
  body?: string;
  templates?: EmailTemplate[];
  contacts?: EmailContact[];
  attachments?: EmailAttachment[];
  onSaveDraft?: (emailData: EmailData) => void;
  onAttachFile?: () => void;
  maxAttachmentSize?: number; // in bytes
  loading?: boolean;
  error?: string;
}

interface EmailData {
  to: EmailContact[];
  cc: EmailContact[];
  bcc: EmailContact[];
  subject: string;
  body: string;
  attachments: EmailAttachment[];
  template?: string;
}

const validationSchema = Yup.object({
  to: Yup.array()
    .of(
      Yup.object({
        email: Yup.string().email('Μη έγκυρο email').required(),
      })
    )
    .min(1, 'Απαιτείται τουλάχιστον ένας παραλήπτης'),
  subject: Yup.string().required('Το θέμα είναι υποχρεωτικό'),
  body: Yup.string().required('Το κείμενο του email είναι υποχρεωτικό'),
});

const EmailDialog: React.FC<EmailDialogProps> = ({
  open,
  onClose,
  onSend,
  to = [],
  cc = [],
  bcc = [],
  subject = '',
  body = '',
  templates = [],
  contacts = [],
  attachments = [],
  onSaveDraft,
  onAttachFile,
  maxAttachmentSize = 10 * 1024 * 1024, // 10MB default
  loading = false,
  error,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [recipientType, setRecipientType] = useState<'to' | 'cc' | 'bcc'>('to');

  const formik = useFormik<EmailData>({
    initialValues: {
      to,
      cc,
      bcc,
      subject,
      body,
      attachments,
      template: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSend(values);
      if (!error) {
        onClose();
      }
    },
  });

  useEffect(() => {
    formik.setValues({
      to,
      cc,
      bcc,
      subject,
      body,
      attachments,
      template: '',
    });
  }, [to, cc, bcc, subject, body, attachments]);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      formik.setFieldValue('subject', template.subject);
      formik.setFieldValue('body', template.body);
      formik.setFieldValue('template', templateId);
    }
  };

  const handleAddRecipient = (contact: EmailContact | null, type: 'to' | 'cc' | 'bcc') => {
    if (contact) {
      const currentRecipients = formik.values[type];
      if (!currentRecipients.find(r => r.email === contact.email)) {
        formik.setFieldValue(type, [...currentRecipients, contact]);
      }
    }
  };

  const handleRemoveRecipient = (email: string, type: 'to' | 'cc' | 'bcc') => {
    const currentRecipients = formik.values[type];
    formik.setFieldValue(
      type,
      currentRecipients.filter(r => r.email !== email)
    );
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    formik.setFieldValue(
      'attachments',
      formik.values.attachments.filter(a => a.id !== attachmentId)
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalAttachmentSize = () => {
    return formik.values.attachments.reduce((total, att) => total + att.size, 0);
  };

  const replaceVariables = (text: string) => {
    // Simple variable replacement - in real app, this would be more sophisticated
    return text
      .replace(/{{name}}/g, formik.values.to[0]?.name || 'Παραλήπτης')
      .replace(/{{date}}/g, new Date().toLocaleDateString('el-GR'))
      .replace(/{{time}}/g, new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: 800,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Νέο Email</Typography>
          <Box>
            <ToggleButtonGroup
              value={showPreview}
              exclusive
              onChange={(e, value) => setShowPreview(value)}
              size="small"
            >
              <ToggleButton value={false}>
                <CodeIcon fontSize="small" sx={{ mr: 0.5 }} />
                Επεξεργασία
              </ToggleButton>
              <ToggleButton value={true}>
                <VisibilityIcon fontSize="small" sx={{ mr: 0.5 }} />
                Προεπισκόπηση
              </ToggleButton>
            </ToggleButtonGroup>
            <IconButton onClick={onClose} sx={{ ml: 1 }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => {}}>
              {error}
            </Alert>
          )}

          {!showPreview ? (
            <>
              {/* Template Selection */}
              {templates.length > 0 && (
                <FormControl fullWidth size="small">
                  <InputLabel>Πρότυπο Email</InputLabel>
                  <Select
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    label="Πρότυπο Email"
                  >
                    <MenuItem value="">
                      <em>Χωρίς πρότυπο</em>
                    </MenuItem>
                    {templates.map(template => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Recipients */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ToggleButtonGroup
                    value={recipientType}
                    exclusive
                    onChange={(e, value) => value && setRecipientType(value)}
                    size="small"
                  >
                    <ToggleButton value="to">Προς</ToggleButton>
                    <ToggleButton value="cc">Κοινοποίηση</ToggleButton>
                    <ToggleButton value="bcc">Κρυφή Κοιν.</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Autocomplete
                  options={contacts}
                  getOptionLabel={(option) => `${option.name} <${option.email}>`}
                  renderOption={(props, option) => (
                    <ListItem {...props}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <PersonIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={option.name}
                        secondary={option.email}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Προσθήκη παραλήπτη..."
                      size="small"
                      error={recipientType === 'to' && formik.touched.to && Boolean(formik.errors.to)}
                      helperText={recipientType === 'to' && formik.touched.to && formik.errors.to}
                    />
                  )}
                  onChange={(e, value) => handleAddRecipient(value, recipientType)}
                  value={null}
                  clearOnBlur
                />

                {/* Display Recipients */}
                {['to', 'cc', 'bcc'].map(type => {
                  const recipients = formik.values[type as keyof EmailData] as EmailContact[];
                  if (recipients.length === 0) return null;

                  return (
                    <Box key={type} sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {type === 'to' ? 'Προς:' : type === 'cc' ? 'Κοινοποίηση:' : 'Κρυφή Κοιν.:'}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {recipients.map(recipient => (
                          <Chip
                            key={recipient.email}
                            label={`${recipient.name} <${recipient.email}>`}
                            size="small"
                            onDelete={() => handleRemoveRecipient(recipient.email, type as any)}
                          />
                        ))}
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {/* Subject */}
              <TextField
                fullWidth
                label="Θέμα"
                name="subject"
                value={formik.values.subject}
                onChange={formik.handleChange}
                error={formik.touched.subject && Boolean(formik.errors.subject)}
                helperText={formik.touched.subject && formik.errors.subject}
                required
              />

              {/* Body */}
              <TextField
                fullWidth
                label="Κείμενο Email"
                name="body"
                value={formik.values.body}
                onChange={formik.handleChange}
                error={formik.touched.body && Boolean(formik.errors.body)}
                helperText={formik.touched.body && formik.errors.body}
                multiline
                rows={10}
                required
              />

              {/* Attachments */}
              {(formik.values.attachments.length > 0 || onAttachFile) && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2">
                      Συνημμένα ({formatFileSize(getTotalAttachmentSize())})
                    </Typography>
                    {onAttachFile && (
                      <Button
                        size="small"
                        startIcon={<AttachFileIcon />}
                        onClick={onAttachFile}
                      >
                        Προσθήκη αρχείου
                      </Button>
                    )}
                  </Box>
                  {formik.values.attachments.length > 0 && (
                    <List dense>
                      {formik.values.attachments.map(attachment => (
                        <ListItem
                          key={attachment.id}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleRemoveAttachment(attachment.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          }
                        >
                          <ListItemIcon>
                            <AttachmentIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={attachment.name}
                            secondary={formatFileSize(attachment.size)}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                  {getTotalAttachmentSize() > maxAttachmentSize && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Το συνολικό μέγεθος των συνημμένων υπερβαίνει το όριο των {formatFileSize(maxAttachmentSize)}
                    </Alert>
                  )}
                </Box>
              )}
            </>
          ) : (
            /* Preview Mode */
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Προς:</Typography>
              <Typography variant="body2" gutterBottom>
                {formik.values.to.map(r => `${r.name} <${r.email}>`).join(', ')}
              </Typography>
              
              {formik.values.cc.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>Κοινοποίηση:</Typography>
                  <Typography variant="body2" gutterBottom>
                    {formik.values.cc.map(r => `${r.name} <${r.email}>`).join(', ')}
                  </Typography>
                </>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                {replaceVariables(formik.values.subject)}
              </Typography>
              
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {replaceVariables(formik.values.body)}
              </Typography>
              
              {formik.values.attachments.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Συνημμένα ({formik.values.attachments.length})
                  </Typography>
                  {formik.values.attachments.map(att => (
                    <Chip
                      key={att.id}
                      label={`${att.name} (${formatFileSize(att.size)})`}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          {onSaveDraft && (
            <Button
              onClick={() => onSaveDraft(formik.values)}
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              Αποθήκευση Προσχεδίου
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button onClick={onClose} disabled={loading}>
            Ακύρωση
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            disabled={loading || !formik.isValid || getTotalAttachmentSize() > maxAttachmentSize}
          >
            Αποστολή
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EmailDialog;
