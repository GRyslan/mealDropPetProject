import React, {useState} from 'react';
import { Dialog, Grid, Typography} from '@mui/material';
import * as yup from 'yup';
import { useFormik } from 'formik';
import FormikTemplate from '../formik/FormikTemplate';
import {authLogin,authRegister} from '../formik/authModalValues';
import {IAuthModal} from '../../interfaces/IAuthModal';
import {StyledButton, StyledButtonAuth} from '../../ui/generalComponents/StyledButton';
import {usersApi} from '../../services/userApi';
import {IUserLoginRequest, UserRegisterRequest} from '../../interfaces/IUserApi';
import {useTypedDispatch} from '../../hooks/redux';
import {setToken, toggleAuth} from '../../store/reducers/authSlice';

const validationSchemaLogin = yup.object({
  email: yup
    .string()
    .required('Email is required').email('Email not valid').max(254,"Max Length 254"),
  password: yup
    .string()
    .required('Password is required')
});
const validationSchemaRegister = yup.object({
  email: yup
    .string()
    .required('Email is required').email('Email not valid').max(254,"Max Length 254"),
  name:yup.string().required('Name is required').max(16,"Max length 16"),
  password: yup
    .string()
    .required('Password is required').matches(/^[a-zA-Z0-9!@#$%^&*]*$/).min(8,"Min length 8").max(16,"Max length 16"),
});
const loginInitial = {
  email: '',
  password: "",
} as IUserLoginRequest;
const authInitial = {
  ...loginInitial,
  name:""
} as IUserLoginRequest;
export function AuthModal({ handleClose, open}: IAuthModal) {
  const [isLogin,setAuth] = useState(true);
  const handleChangeAuth = ()=>setAuth(!isLogin);
  const dispatch=useTypedDispatch()
  const [login] = usersApi.useLoginUserMutation();
  const {refetch} = usersApi.useGetAllUsersQuery();
  const [register] = usersApi.useRegisterUserMutation();
  const { resetForm, handleBlur, handleChange, handleSubmit, touched, values, errors } = useFormik({
    initialValues: isLogin ? loginInitial  : authInitial ,
    validationSchema: isLogin ? validationSchemaLogin : validationSchemaRegister,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        console.log(JSON.stringify(values, null, 2));
        let data : any
        if(isLogin){
           data = await login({email: values.email, password: values.password}).unwrap()
        }
        else {
          data = await register({email: values.email, name: values.name, password: values.password}).unwrap()
        }
        console.log(data)
        localStorage.setItem('token', data.user.accessToken );
        dispatch(toggleAuth(true))
        dispatch(setToken(data.user.accessToken ));
        await refetch()

        console.log(data);
        resetForm();

        return handleClose()
      }
      catch(e:any){
        return alert(JSON.stringify(e.data.message))
      }
    },
  });
  return (
    <Dialog open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit}>

        <Grid container spacing={1} sx={{ padding: '20px' }}>
          <Grid item xs={12}>
            <Typography variant='h4' component='div'>{isLogin ? 'Login' : 'Register'}</Typography>
          </Grid>
          <FormikTemplate config={isLogin ? authLogin : authRegister} handleChange={handleChange} touched={touched} errors={errors}
                         handleBlur={handleBlur} values={values} />
          <Grid item xs={12} >
            {isLogin ? <div>Don't have account yet ? <br/> Click <StyledButtonAuth onClick={handleChangeAuth }>REGISTER</StyledButtonAuth></div>
              : <div>Already have account ? <br/>Click <StyledButtonAuth onClick={handleChangeAuth }>LOGIN</StyledButtonAuth></div>}
          </Grid>

          <Grid item xs={6} display='flex' justifyContent='end'>
            <StyledButton type='submit'>Save</StyledButton>
          </Grid>
          <Grid item xs={3} display='flex' justifyContent='end'>
            <StyledButton onClick={() => resetForm()}>Clear</StyledButton>
          </Grid>
          <Grid item xs={3} display='flex' justifyContent='end'>
            <StyledButton onClick={handleClose}>Cancel</StyledButton>
          </Grid>
        </Grid>
      </form>
    </Dialog>
  );
}
