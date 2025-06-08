import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
  Divider,
  Slide
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import CancelOutlined from '@mui/icons-material/CancelOutlined';

const TagForm = () => {
  const { tagId } = useParams();
  const location = useLocation();
  const isViewMode = location.pathname.startsWith('/tags/view/');
  const isEditMode = location.pathname.startsWith('/tags/edit/');
  const mode = isViewMode ? 'view' : isEditMode ? 'edit' : 'create';

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    reset,
    watch
  } = useForm();
  const navigate = useNavigate();
  const [tag, setTag] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (mode !== 'create') {
      const fetchTag = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/tags/${tagId}`);
          setTag(response.data);
          reset({ tagName: response.data.tagName });
        } catch (error) {
          console.error('Error fetching tag:', error);
          navigate('/tags');
        }
      };
      fetchTag();
    }
  }, [tagId, mode, reset, navigate]);

  const handleFormSubmit = async (data) => {
    try {
      if (mode === 'edit') {
        await axios.put(`http://localhost:3000/tags/${tagId}`, {
          tagName: data.tagName
        });
      } else if (mode === 'create') {
        await axios.post('http://localhost:3000/tags', {
          tagName: data.tagName
        });
      }
      navigate('/tags');
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/tags/${tagId}`);
      navigate('/tags');
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const handleCancel = () => {
    if (mode === 'edit') reset({ tagName: tag?.tagName });
    else navigate('/tags');
  };

  const tagName = watch('tagName') || tag?.tagName || '';

  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
      <Paper
        sx={{
          p: { xs: 3, md: 6 },
          maxWidth: 600,
          mx: 'auto',
          my: { xs: 2, md: 6 },
          borderRadius: 4,
          boxShadow: '0px 10px 30px rgba(0,0,0,0.08)',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(0,0,0,0.05)',
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            bgcolor: 'primary.main'
          }
        }}
      >
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
          <IconButton 
            onClick={() => navigate('/tags')}
            sx={{ 
              color: 'primary.main',
              '&:hover': { 
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowBack fontSize="medium" />
          </IconButton>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px'
            }}
          >
            {mode === 'view' ? 'TAG DETAILS' : `${mode.toUpperCase()} TAG`}
          </Typography>
        </Box>

        {/* Tag Preview Avatar */}
        {tagName && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 4,
            transition: 'all 0.3s ease'
          }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: '#3f51b5',
                fontSize: 48,
                fontWeight: 700,
                transform: isHovered ? 'scale(1.05) rotate(5deg)' : 'scale(1)',
                boxShadow: 3,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {tagName.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        )}

        <Divider sx={{ mb: 4, borderColor: 'rgba(0,0,0,0.08)' }} />

        {/* Form Section */}
        <Box
          component="form"
          onSubmit={handleSubmit(handleFormSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          <TextField
            fullWidth
            label="Tag Name"
            variant="outlined"
            disabled={mode === 'view'}
            {...register('tagName', { 
              required: mode !== 'view' && 'Tag name is required',
              minLength: mode !== 'view' && {
                value: 2,
                message: 'Tag name must be at least 2 characters'
              },
              maxLength: mode !== 'view' && {
                value: 20,
                message: 'Tag name cannot exceed 20 characters'
              }
            })}
            error={!!errors.tagName}
            helperText={errors.tagName?.message}
            InputProps={{
              readOnly: mode === 'view',
              sx: { 
                borderRadius: 3,
                fontSize: 16,
                '&.Mui-focused': {
                  boxShadow: '0 0 0 2px rgba(63, 81, 181, 0.2)'
                }
              }
            }}
            InputLabelProps={{
              shrink: true,
              sx: { fontWeight: 500 }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(0,0,0,0.1)'
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main'
                }
              }
            }}
          />

          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: mode === 'view' ? 'center' : 'flex-end',
            mt: 4
          }}>
            {mode === 'view' ? (
              <Button
                variant="contained"
                onClick={() => navigate('/tags')}
                startIcon={<ArrowBack />}
                sx={primaryButtonStyle}
              >
                BACK TO LIST
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleCancel}
                  startIcon={<CancelOutlined />}
                  sx={secondaryButtonStyle}
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleOutline />}
                  sx={primaryButtonStyle}
                >
                  {mode === 'edit' ? 'UPDATE' : 'CREATE'}
                </Button>
                {mode === 'edit' && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => setOpenDeleteDialog(true)}
                    startIcon={<DeleteOutline />}
                    sx={dangerButtonStyle}
                  >
                    DELETE
                  </Button>
                )}
              </>
            )}
          </Box>
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={openDeleteDialog} 
          onClose={() => setOpenDeleteDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 2,
              minWidth: 400
            }
          }}
        >
          <DialogTitle sx={{ 
            fontWeight: 700,
            color: 'error.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <DeleteOutline fontSize="medium" />
            Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontSize: 16 }}>
              Are you sure you want to delete the tag <strong>"{tag?.tagName}"</strong>? 
              This action cannot be undone and will permanently remove the tag.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={() => setOpenDeleteDialog(false)}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: 1
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete} 
              color="error" 
              variant="contained"
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: 1,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 2px 10px rgba(244, 67, 54, 0.3)'
                }
              }}
            >
              Delete Permanently
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Slide>
  );
};

// Button Styles
const primaryButtonStyle = {
  px: 4,
  py: 1.5,
  borderRadius: 3,
  textTransform: 'uppercase',
  fontWeight: 700,
  letterSpacing: 1,
  fontSize: 14,
  boxShadow: 'none',
  background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
    transform: 'translateY(-1px)'
  },
  '&:disabled': {
    background: '#e0e0e0'
  },
  transition: 'all 0.2s ease'
};

const secondaryButtonStyle = {
  px: 4,
  py: 1.5,
  borderRadius: 3,
  textTransform: 'uppercase',
  fontWeight: 700,
  letterSpacing: 1,
  fontSize: 14,
  borderWidth: 2,
  '&:hover': {
    borderWidth: 2,
    backgroundColor: 'rgba(63, 81, 181, 0.08)'
  },
  transition: 'all 0.2s ease'
};

const dangerButtonStyle = {
  px: 4,
  py: 1.5,
  borderRadius: 3,
  textTransform: 'uppercase',
  fontWeight: 700,
  letterSpacing: 1,
  fontSize: 14,
  boxShadow: 'none',
  background: 'linear-gradient(45deg, #f44336 30%, #ff5252 90%)',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
    transform: 'translateY(-1px)'
  },
  transition: 'all 0.2s ease'
};

export default TagForm;