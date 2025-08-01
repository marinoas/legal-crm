import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Grid,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem,
  Alert,
  FormControlLabel,
  Checkbox,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  LinearProgress,
  Breadcrumbs,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Badge,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Description,
  Folder,
  FolderOpen,
  Upload,
  Download,
  Email,
  Edit,
  Delete,
  Share,
  Print,
  Search,
  FilterList,
  GridView,
  ViewList,
  ExpandMore,
  InsertDriveFile,
  PictureAsPdf,
  Image,
  Article,
  Gavel,
  Person,
  Lock,
  LockOpen,
  Visibility,
  CloudUpload,
  CreateNewFolder,
  DriveFileRenameOutline,
  ContentCopy,
  Forward,
  Star,
  StarBorder,
  AccessTime,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { documentService } from '../../services/documentService';
import { emailService } from '../../services/emailService';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../hooks/useSnackbar';
import { usePermissions } from '../../hooks/usePermissions';
import { formatDate, formatFileSize } from '../../utils/formatters';

interface Document {
  id: string;
  name: string;
  type: 'client_document' | 'legal_document' | 'court_document' | 'correspondence' | 'other';
  category: string;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    folderNumber: string;
  };
  court?: {
    id: string;
    type: string;
    date: string;
  };
  file: {
    name: string;
    size: number;
    mimeType: string;
    url: string;
    uploadedAt: string;
  };
  folder: string;
  tags: string[];
  isConfidential: boolean;
  isStarred: boolean;
  version: number;
  versions?: Array<{
    version: number;
    uploadedAt: string;
    uploadedBy: string;
    size: number;
  }>;
  sharedWith?: string[];
  metadata?: {
    aiProcessed?: boolean;
    extractedText?: string;
    classification?: string;
    keywords?: string[];
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentFolder {
  id: string;
  name: string;
  path: string;
  parent?: string;
  documentCount: number;
  subfolders?: DocumentFolder[];
}

const DocumentsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const { showSnackbar } = useSnackbar();
  
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentFolder, setCurrentFolder] = useState<string>('/');
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  
  // Get filters from URL params
  const clientId = searchParams.get('clientId');
  const courtId = searchParams.get('courtId');
  const deadlineId = searchParams.get('deadlineId');
  
  // Client portal restrictions
  const isClientPortal = user?.role === 'client';

  useEffect(() => {
    loadFolders();
    loadDocuments();
  }, [currentFolder, searchTerm, filterType, clientId, courtId]);

  const loadFolders = async () => {
    try {
      const data = await documentService.getFolders(currentFolder);
      setFolders(data);
    } catch (error) {
      showSnackbar(t('documents.foldersLoadError'), 'error');
    }
  };

  const loadDocuments = async () => {
    try {
      const data = await documentService.getAll({
        folder: currentFolder,
        search: searchTerm,
        type: filterType === 'all' ? undefined : filterType,
        clientId,
        courtId,
        deadlineId,
      });
      setDocuments(data.items);
    } catch (error) {
      showSnackbar(t('documents.loadError'), 'error');
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', currentFolder);
        formData.append('type', filterType === 'all' ? 'other' : filterType);
        if (clientId) formData.append('clientId', clientId);
        if (courtId) formData.append('courtId', courtId);
        
        await documentService.upload(formData, {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
            setUploadProgress(progress);
          },
        });
        
        showSnackbar(t('documents.uploadSuccess', { name: file.name }), 'success');
      }
      
      loadDocuments();
      setShowUploadDialog(false);
    } catch (error) {
      showSnackbar(t('documents.uploadError'), 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      await documentService.createFolder({
        name: newFolderName,
        parent: currentFolder,
      });
      
      showSnackbar(t('documents.folderCreated'), 'success');
      setShowFolderDialog(false);
      setNewFolderName('');
      loadFolders();
    } catch (error) {
      showSnackbar(t('documents.folderError'), 'error');
    }
  };

  const handleDelete = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => documentService.delete(id)));
      showSnackbar(t('documents.deleteSuccess', { count: ids.length }), 'success');
      setSelectedDocuments([]);
      loadDocuments();
    } catch (error) {
      showSnackbar(t('documents.deleteError'), 'error');
    }
  };

  const handleRename = async () => {
    if (!selectedDocument || !renameValue.trim()) return;
    
    try {
      await documentService.rename(selectedDocument.id, renameValue);
      showSnackbar(t('documents.renameSuccess'), 'success');
      setShowRenameDialog(false);
      setRenameValue('');
      loadDocuments();
    } catch (error) {
      showSnackbar(t('documents.renameError'), 'error');
    }
  };

  const handleShare = async () => {
    if (!selectedDocument || !shareEmail.trim()) return;
    
    try {
      await documentService.share(selectedDocument.id, shareEmail);
      
      // Send email notification
      const template = await emailService.getTemplate('document_shared', {
        documentName: selectedDocument.name,
        sharedBy: `${user?.firstName} ${user?.lastName}`,
      });
      
      await emailService.send({
        to: shareEmail,
        subject: t('documents.email.shared.subject'),
        body: template,
      });
      
      showSnackbar(t('documents.shareSuccess'), 'success');
      setShowShareDialog(false);
      setShareEmail('');
    } catch (error) {
      showSnackbar(t('documents.shareError'), 'error');
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const blob = await documentService.download(document.id);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file.name;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showSnackbar(t('documents.downloadError'), 'error');
    }
  };

  const handleToggleStar = async (document: Document) => {
    try {
      await documentService.toggleStar(document.id);
      loadDocuments();
    } catch (error) {
      showSnackbar(t('common.error.generic'), 'error');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <PictureAsPdf color="error" />;
    if (mimeType.includes('image')) return <Image color="primary" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <Article color="info" />;
    return <InsertDriveFile />;
  };

  const renderBreadcrumbs = () => {
    const paths = currentFolder.split('/').filter(Boolean);
    
    return (
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => setCurrentFolder('/')}
          underline="hover"
        >
          {t('documents.root')}
        </Link>
        {paths.map((path, index) => {
          const fullPath = '/' + paths.slice(0, index + 1).join('/');
          return (
            <Link
              key={fullPath}
              component="button"
              variant="body1"
              onClick={() => setCurrentFolder(fullPath)}
              underline="hover"
            >
              {path}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };

  const renderFolders = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {folders.map(folder => (
        <Grid item xs={6} sm={4} md={3} key={folder.id}>
          <Card
            sx={{
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => setCurrentFolder(folder.path)}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <FolderOpen sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="body2" noWrap>
                {folder.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('documents.itemCount', { count: folder.documentCount })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderDocumentGrid = () => (
    <Grid container spacing={2}>
      {documents.map(doc => (
        <Grid item xs={6} sm={4} md={3} key={doc.id}>
          <Card sx={{ position: 'relative' }}>
            {doc.isConfidential && (
              <Chip
                icon={<Lock />}
                label={t('documents.confidential')}
                size="small"
                color="error"
                sx={{ position: 'absolute', top: 8, right: 8 }}
              />
            )}
            
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                {getFileIcon(doc.file.mimeType)}
              </Box>
              
              <Typography variant="body2" noWrap title={doc.name}>
                {doc.name}
              </Typography>
              
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(doc.file.size)}
              </Typography>
              
              {doc.client && (
                <Typography variant="caption" display="block" color="primary">
                  {doc.client.lastName} {doc.client.firstName}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <IconButton size="small" onClick={() => handleToggleStar(doc)}>
                  {doc.isStarred ? <Star color="warning" /> : <StarBorder />}
                </IconButton>
                
                <IconButton size="small" onClick={() => handleDownload(doc)}>
                  <Download />
                </IconButton>
                
                {!isClientPortal && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setSelectedDocument(doc);
                      setAnchorEl(e.currentTarget);
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderDocumentList = () => (
    <List>
      {documents.map(doc => (
        <ListItem
          key={doc.id}
          divider
          secondaryAction={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small" onClick={() => handleToggleStar(doc)}>
                {doc.isStarred ? <Star color="warning" /> : <StarBorder />}
              </IconButton>
              
              <IconButton size="small" onClick={() => handleDownload(doc)}>
                <Download />
              </IconButton>
              
              {!isClientPortal && (
                <>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedDocument(doc);
                      setShowPreview(true);
                    }}
                  >
                    <Visibility />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setSelectedDocument(doc);
                      setAnchorEl(e.currentTarget);
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                </>
              )}
            </Box>
          }
        >
          <ListItemAvatar>
            <Avatar>{getFileIcon(doc.file.mimeType)}</Avatar>
          </ListItemAvatar>
          
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1">{doc.name}</Typography>
                {doc.isConfidential && <Lock fontSize="small" color="error" />}
                {doc.version > 1 && (
                  <Chip label={`v${doc.version}`} size="small" />
                )}
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="caption" component="span">
                  {formatFileSize(doc.file.size)} • {formatDate(doc.file.uploadedAt)}
                </Typography>
                {doc.client && (
                  <Typography variant="caption" component="span" sx={{ ml: 1 }}>
                    • {doc.client.lastName} {doc.client.firstName}
                  </Typography>
                )}
                {doc.tags.length > 0 && (
                  <Box sx={{ mt: 0.5 }}>
                    {doc.tags.map(tag => (
                      <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                    ))}
                  </Box>
                )}
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );

  const renderClientDocuments = () => {
    // For client portal - special view with watermarking notice
    return (
      <>
        <Alert severity="info" sx={{ mb: 2 }}>
          {t('documents.clientNotice')}
        </Alert>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('documents.yourDocuments')}
              </Typography>
              <List>
                {documents.filter(d => d.type === 'client_document').map(doc => (
                  <ListItem key={doc.id}>
                    <ListItemAvatar>
                      <Avatar>{getFileIcon(doc.file.mimeType)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={doc.name}
                      secondary={formatDate(doc.file.uploadedAt)}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => handleDownload(doc)}>
                        <Download />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('documents.legalDocuments')}
              </Typography>
              <Alert severity="warning" sx={{ mb: 1 }}>
                {t('documents.watermarkNotice')}
              </Alert>
              <List>
                {documents.filter(d => d.type === 'legal_document').map(doc => (
                  <ListItem key={doc.id}>
                    <ListItemAvatar>
                      <Avatar>
                        <Gavel />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={doc.name}
                      secondary={formatDate(doc.file.uploadedAt)}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title={t('documents.viewOnly')}>
                        <IconButton onClick={() => setShowPreview(true)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('documents.printOnly')}>
                        <IconButton onClick={() => window.print()}>
                          <Print />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </>
    );
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('documents.title')}</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {!isClientPortal && (
            <>
              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={(e, newView) => newView && setView(newView)}
                size="small"
              >
                <ToggleButton value="list">
                  <ViewList />
                </ToggleButton>
                <ToggleButton value="grid">
                  <GridView />
                </ToggleButton>
              </ToggleButtonGroup>
              
              <Button
                variant="contained"
                startIcon={<Upload />}
                onClick={() => setShowUploadDialog(true)}
              >
                {t('documents.upload')}
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Search and Filters */}
      {!isClientPortal && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            size="small"
            placeholder={t('documents.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />
          
          <TextField
            select
            size="small"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="all">{t('common.all')}</MenuItem>
            <MenuItem value="client_document">{t('documents.type.client_document')}</MenuItem>
            <MenuItem value="legal_document">{t('documents.type.legal_document')}</MenuItem>
            <MenuItem value="court_document">{t('documents.type.court_document')}</MenuItem>
            <MenuItem value="correspondence">{t('documents.type.correspondence')}</MenuItem>
            <MenuItem value="other">{t('documents.type.other')}</MenuItem>
          </TextField>
        </Box>
      )}

      {/* Content */}
      {isClientPortal ? (
        renderClientDocuments()
      ) : (
        <>
          {renderBreadcrumbs()}
          {folders.length > 0 && renderFolders()}
          <Divider sx={{ my: 2 }} />
          {view === 'grid' ? renderDocumentGrid() : renderDocumentList()}
        </>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)}>
        <DialogTitle>{t('documents.uploadTitle')}</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CloudUpload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              {t('documents.dragDropHint')}
            </Typography>
            <Button
              variant="contained"
              component="label"
              disabled={isUploading}
            >
              {t('documents.selectFiles')}
              <input
                type="file"
                hidden
                multiple
                onChange={(e) => handleUpload(e.target.files)}
              />
            </Button>
            
            {isUploading && (
              <Box sx={{ mt: 3 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="caption" sx={{ mt: 1 }}>
                  {t('documents.uploading', { progress: uploadProgress })}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={showFolderDialog} onClose={() => setShowFolderDialog(false)}>
        <DialogTitle>{t('documents.createFolder')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('documents.folderName')}
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFolderDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCreateFolder} variant="contained">
            {t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          setRenameValue(selectedDocument?.name || '');
          setShowRenameDialog(true);
          setAnchorEl(null);
        }}>
          <DriveFileRenameOutline fontSize="small" sx={{ mr: 1 }} />
          {t('documents.rename')}
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedDocument) {
            navigator.clipboard.writeText(selectedDocument.file.url);
            showSnackbar(t('documents.linkCopied'), 'success');
          }
          setAnchorEl(null);
        }}>
          <ContentCopy fontSize="small" sx={{ mr: 1 }} />
          {t('documents.copyLink')}
        </MenuItem>
        
        <MenuItem onClick={() => {
          setShowShareDialog(true);
          setAnchorEl(null);
        }}>
          <Share fontSize="small" sx={{ mr: 1 }} />
          {t('documents.share')}
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={() => {
          if (selectedDocument) {
            handleDelete([selectedDocument.id]);
          }
          setAnchorEl(null);
        }} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          {t('common.delete')}
        </MenuItem>
      </Menu>

      {/* Speed Dial for folder actions */}
      {!isClientPortal && (
        <SpeedDial
          ariaLabel="Document actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
          onClose={() => setSpeedDialOpen(false)}
          onOpen={() => setSpeedDialOpen(true)}
          open={speedDialOpen}
        >
          <SpeedDialAction
            icon={<Upload />}
            tooltipTitle={t('documents.upload')}
            onClick={() => {
              setShowUploadDialog(true);
              setSpeedDialOpen(false);
            }}
          />
          <SpeedDialAction
            icon={<CreateNewFolder />}
            tooltipTitle={t('documents.createFolder')}
            onClick={() => {
              setShowFolderDialog(true);
              setSpeedDialOpen(false);
            }}
          />
        </SpeedDial>
      )}
    </Box>
  );
};

export default DocumentsPage;
