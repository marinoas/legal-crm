import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  PersonAdd as PersonAddIcon,
  Email as EmailIcon
} from '@mui/icons-material';

interface EmailModalProps {
  open: boolean;
  onClose: () => void;
  defaultRecipient?: string;
  emailType: 'court' | 'deadline' | 'pending' | 'appointment';
  contextData?: {
    title: string;
    client?: string;
    details?: string;
  };
}

const EmailModal: React.FC<EmailModalProps> = ({
  open,
  onClose,
  defaultRecipient = '',
  emailType,
  contextData
}) => {
  const [recipients, setRecipients] = useState<string[]>(
    defaultRecipient ? [defaultRecipient] : []
  );
  const [newRecipient, setNewRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Προδιατυπωμένα κείμενα ανά τύπο
  const getEmailTemplate = () => {
    const templates = {
      court: {
        subject: `Ενημέρωση για δικάσιμο: ${contextData?.title || ''}`,
        message: `Αγαπητέ/ή ${defaultRecipient || 'Εντολέα'},

Σας ενημερώνουμε για την επερχόμενη δικάσιμο:

Υπόθεση: ${contextData?.title || ''}
Λεπτομέρειες: ${contextData?.details || ''}

Παρακαλούμε να είστε παρόντες στην ώρα που έχει οριστεί.

Με εκτίμηση,
Μάριος Μαρινάκος
Δικηγόρος`
      },
      deadline: {
        subject: `Υπενθύμιση προθεσμίας: ${contextData?.title || ''}`,
        message: `Αγαπητέ/ή ${defaultRecipient || 'Εντολέα'},

Σας υπενθυμίζουμε την επερχόμενη προθεσμία:

Προθεσμία: ${contextData?.title || ''}
Λεπτομέρειες: ${contextData?.details || ''}

Παρακαλούμε να προετοιμάσετε τα απαραίτητα έγγραφα.

Με εκτίμηση,
Μάριος Μαρινάκος
Δικηγόρος`
      },
      pending: {
        subject: `Ενημέρωση για εκκρεμότητα: ${contextData?.title || ''}`,
        message: `Αγαπητέ/ή ${defaultRecipient || 'Εντολέα'},

Σας ενημερώνουμε για την εκκρεμότητα:

Εργασία: ${contextData?.title || ''}
Λεπτομέρειες: ${contextData?.details || ''}

Θα σας ενημερώσουμε για την πρόοδο.

Με εκτίμηση,
Μάριος Μαρινάκος
Δικηγόρος`
      },
      appointment: {
        subject: `Επιβεβαίωση ραντεβού: ${contextData?.title || ''}`,
        message: `Αγαπητέ/ή ${defaultRecipient || 'Εντολέα'},

Επιβεβαιώνουμε το ραντεβού σας:

Ραντεβού: ${contextData?.title || ''}
Λεπτομέρειες: ${contextData?.details || ''}

Παρακαλούμε να είστε παρόντες στην ώρα που έχει οριστεί.

Με εκτίμηση,
Μάριος Μαρινάκος
Δικηγόρος`
      }
    };

    return templates[emailType];
  };

  // Αρχικοποίηση με προδιατυπωμένο κείμενο
  React.useEffect(() => {
    if (open) {
      const template = getEmailTemplate();
      setSubject(template.subject);
      setMessage(template.message);
    }
  }, [open, emailType, contextData, defaultRecipient]);

  const handleAddRecipient = () => {
    if (newRecipient && !recipients.includes(newRecipient)) {
      setRecipients([...recipients, newRecipient]);
      setNewRecipient('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleSend = () => {
    // Εδώ θα υλοποιηθεί η αποστολή email
    console.log('Αποστολή email:', {
      recipients,
      subject,
      message
    });
    
    // Προσωρινό alert για testing
    alert(`Email στάλθηκε σε: ${recipients.join(', ')}\nΘέμα: ${subject}`);
    
    onClose();
  };

  const handleContactsClick = () => {
    // Εδώ θα ανοίξει η λίστα επαφών
    alert('Άνοιγμα λίστας επαφών (θα υλοποιηθεί)');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '500px'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon color="primary" />
          <Typography variant="h6">
            Αποστολή Email
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={3}>
          {/* Παραλήπτες */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Παραλήπτες:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {recipients.map((email, index) => (
                <Chip
                  key={index}
                  label={email}
                  onDelete={() => handleRemoveRecipient(email)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Προσθήκη παραλήπτη..."
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="outlined"
                onClick={handleAddRecipient}
                disabled={!newRecipient}
              >
                Προσθήκη
              </Button>
              <Button
                variant="outlined"
                onClick={handleContactsClick}
                startIcon={<PersonAddIcon />}
              >
                Επαφές
              </Button>
            </Box>
          </Box>

          {/* Θέμα */}
          <TextField
            label="Θέμα"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            fullWidth
            required
          />

          {/* Κείμενο */}
          <TextField
            label="Κείμενο"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            rows={8}
            fullWidth
            required
          />
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
        >
          Ακύρωση
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          startIcon={<SendIcon />}
          disabled={recipients.length === 0 || !subject || !message}
        >
          Αποστολή
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailModal;

