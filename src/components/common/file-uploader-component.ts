import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  Button,
  CircularProgress,
  Tooltip,
  useTheme,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GetAppIcon from '@mui/icons-material/GetApp';

export interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  url?: string;
  thumbnailUrl?: string;
}

interface FileUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  onRemove?: (fileId: string) => void;
  onPreview?: (file: UploadFile) => void;
  onDownload?: (file: UploadFile) => void;
  accept?: Record<string, string[]>;
  maxSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  showList?: boolean;
  compact?: boolean;
  files?: UploadFile[];
  title?: string;
  subtitle?: string;
  errorMessage?: string;
  sx?: any;
}

const defaultAccept = {
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/plain': ['.txt'],
};

const FileUploader: React.FC<FileUploaderProps> = ({
  onUpload,
  onRemove,
  onPreview,
  onDownload,
  accept = defaultAccept,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  multiple = true,
  disabled = false,
  showList = true,
  compact = false,
  files = [],
  title = 'Μεταφόρτωση αρχείων',
  subtitle = 'Σύρετε αρχεία εδώ ή κάντε κλικ για επιλογή',
  errorMessage,
  sx = {},
}) => {
  const theme = useTheme();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>(files);
  const [uploading, setUploading] = useState(false);
  const uploadIdCounter = useRef(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map(rejection => {
          if (rejection.errors[0]?.code === 'file-too-large') {
            return `${rejection.file.name}: Το αρχείο υπερβαίνει το μέγιστο μέγεθος`;
          }
          if (rejection.errors[0]?.code === 'file-invalid-type') {
            return `${rejection.file.name}: Μη αποδεκτός τύπος αρχείου`;
          }
          return `${rejection.file.name}: Σφάλμα`;
        });
        alert(errors.join('\n'));
        return;
      }

      // Create upload file objects
      const newFiles: UploadFile[] = acceptedFiles.map(file => ({
        id: `upload-${++uploadIdCounter.current}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending' as const,
        progress: 0,
      }));

      // Update state
      setUploadFiles(prev => [...prev, ...newFiles]);
      setUploading(true);

      // Simulate upload progress
      try {
        await onUpload(acceptedFiles);
        
        // Update files to success status
        setUploadFiles(prev =>
          prev.map(f => {
            const uploadedFile = newFiles.find(nf => nf.id === f.id);
            if (uploadedFile) {
              return { ...f, status: 'success' as const, progress: 100 };
            }
            return f;
          })
        );
      } catch (error) {
        // Update files to error status
        setUploadFiles(prev =>
          prev.map(f => {
            const uploadedFile = newFiles.find(nf => nf.id === f.id);
            if (uploadedFile) {
              return { 
                ...f, 
                status: 'error' as const, 
                error: error instanceof Error ? error.message : 'Σφάλμα μεταφόρτωσης' 
              };
            }
            return f;
          })
        );
      } finally {
        setUploading(false);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: multiple ? maxFiles : 1,
    multiple,
    disabled: disabled || uploading,
  });

  const handleRemove = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
    onRemove?.(fileId);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon />;
    if (type === 'application/pdf') return <PictureAsPdfIcon />;
    if (type.includes('word')) return <DescriptionIcon />;
    if (type.includes('sheet') || type.includes('excel')) return <DescriptionIcon />;
    return <InsertDriveFileIcon />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAcceptedFileTypes = () => {
    const extensions: string[] = [];
    Object.values(accept).forEach(exts => {
      extensions.push(...exts);
    });
    return extensions.join(', ');
  };

  const dropzoneStyles = {
    p: compact ? 2 : 4,
    textAlign: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s',
    borderRadius: 1,
    border: `2px dashed ${
      isDragReject
        ? theme.palette.error.main
        : isDragActive
        ? theme.palette.primary.main
        : theme.palette.divider
    }`,
    bgcolor: isDragActive
      ? theme.palette.action.hover
      : disabled
      ? theme.palette.action.disabledBackground
      : 'background.paper',
    '&:hover': !disabled && {
      borderColor: theme.palette.primary.main,
      bgcolor: theme.palette.action.hover,
    },
    ...sx,
  };

  return (
    <Box>
      <Paper {...getRootProps()} sx={dropzoneStyles}>
        <input {...getInputProps()} />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CloudUploadIcon
            sx={{
              fontSize: compact ? 40 : 60,
              color: isDragActive ? 'primary.main' : 'text.secondary',
            }}
          />
          
          {!compact && (
            <>
              <Typography variant="h6" color="text.primary">
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Αποδεκτοί τύποι: {getAcceptedFileTypes()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Μέγιστο μέγεθος: {formatFileSize(maxSize)}
              </Typography>
            </>
          )}
          
          {compact && (
            <Typography variant="body2" color="text.secondary">
              {isDragActive ? 'Αφήστε τα αρχεία εδώ' : 'Κλικ ή σύρετε αρχεία'}
            </Typography>
          )}
        </Box>
      </Paper>

      {errorMessage && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {showList && uploadFiles.length > 0 && (
        <List sx={{ mt: 2 }}>
          {uploadFiles.map(file => (
            <ListItem
              key={file.id}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                bgcolor: 'background.paper',
              }}
            >
              <ListItemIcon>
                {file.status === 'success' ? (
                  <CheckCircleIcon color="success" />
                ) : file.status === 'error' ? (
                  <ErrorIcon color="error" />
                ) : (
                  getFileIcon(file.type)
                )}
              </ListItemIcon>
              
              <ListItemText
                primary={file.name}
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption">
                      {formatFileSize(file.size)}
                    </Typography>
                    {file.status === 'uploading' && (
                      <Typography variant="caption" color="primary">
                        Μεταφόρτωση... {file.progress}%
                      </Typography>
                    )}
                    {file.status === 'error' && (
                      <Typography variant="caption" color="error">
                        {file.error}
                      </Typography>
                    )}
                  </Box>
                }
              />
              
              {file.status === 'uploading' && (
                <Box sx={{ width: '100%', mr: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={file.progress}
                    sx={{ height: 4, borderRadius: 2 }}
                  />
                </Box>
              )}
              
              <ListItemSecondaryAction>
                {file.status === 'success' && (
                  <>
                    {onPreview && (
                      <Tooltip title="Προεπισκόπηση">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => onPreview(file)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onDownload && (
                      <Tooltip title="Λήψη">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => onDownload(file)}
                        >
                          <GetAppIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                )}
                <Tooltip title="Διαγραφή">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleRemove(file.id)}
                    disabled={file.status === 'uploading'}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {uploading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Μεταφόρτωση αρχείων...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FileUploader;