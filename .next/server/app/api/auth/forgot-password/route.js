"use strict";(()=>{var e={};e.id=9118,e.ids=[9118],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6113:e=>{e.exports=require("crypto")},6005:e=>{e.exports=require("node:crypto")},12021:(e,r,t)=>{t.r(r),t.d(r,{headerHooks:()=>f,originalPathname:()=>x,patchFetch:()=>b,requestAsyncStorage:()=>h,routeModule:()=>m,serverHooks:()=>y,staticGenerationAsyncStorage:()=>g,staticGenerationBailout:()=>w});var o={};t.r(o),t.d(o,{POST:()=>c});var a=t(95419),s=t(69108),i=t(99678),n=t(78070),l=t(57327),d=t(81826),p=t(6113),u=t.n(p);async function c(e){let{email:r}=await e.json();if(!r)return n.Z.json({error:"Email is required"},{status:400});try{let{data:e,error:t}=await l.OQ.from("users").select("id, email, name").eq("email",r).single();if(t||!e)return n.Z.json({message:"If an account exists with this email, a password reset link has been sent."},{status:200});let o=u().randomBytes(32).toString("hex"),a=new Date(Date.now()+36e5).toISOString(),{error:s}=await l.OQ.from("users").update({reset_password_token:o,reset_password_expires:a}).eq("id",e.id);if(s)return console.error("Error saving reset token:",s),n.Z.json({error:"Error processing your request"},{status:500});let i=`${process.env.NEXTAUTH_URL}/reset-password/${o}`;try{await (0,d.Cz)({to:e.email,subject:"Password Reset Request",template:"passwordReset",data:{name:e.name.split(" ")[0],resetLink:i}})}catch(e){return console.error("Error sending reset email:",e),n.Z.json({error:"Error sending reset email"},{status:500})}return n.Z.json({message:"If an account exists with this email, a password reset link has been sent."},{status:200})}catch(e){return console.error("Error in forgot password API:",e),n.Z.json({error:"An error occurred processing your request"},{status:500})}}let m=new a.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/auth/forgot-password/route",pathname:"/api/auth/forgot-password",filename:"route",bundlePath:"app/api/auth/forgot-password/route"},resolvedPagePath:"C:\\Users\\mhx_x\\Documents\\Project\\relearning\\src\\app\\api\\auth\\forgot-password\\route.ts",nextConfigOutput:"standalone",userland:o}),{requestAsyncStorage:h,staticGenerationAsyncStorage:g,serverHooks:y,headerHooks:f,staticGenerationBailout:w}=m,x="/api/auth/forgot-password/route";function b(){return(0,i.patchFetch)({serverHooks:y,staticGenerationAsyncStorage:g})}},81826:(e,r,t)=>{t.d(r,{Cz:()=>s});var o=t(75180);t(6113);let a=new o.R(process.env.RESEND_API_KEY),s=async({to:e,subject:r,template:t,data:o})=>{try{let s="";switch(t){case"welcome":s=i(o?.name);break;case"passwordReset":s=n(o?.name,o?.resetLink);break;case"emailVerification":s=l(o?.name,o?.verificationLink);break;default:throw Error("Invalid email template")}let{data:d,error:p}=await a.emails.send({from:"onboarding@edulearn-platform.com",to:e,subject:r,html:s});if(p)throw console.error("Email sending error:",p),Error(`Failed to send email: ${p.message}`);return{success:!0,id:d?.id}}catch(e){throw console.error("Error sending email:",e),Error(`Email sending failed: ${e.message}`)}},i=(e="there")=>`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to EduLearn</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6;">Welcome to EduLearn!</h1>
        </div>
        <p>Hello ${e},</p>
        <p>We're excited to have you join our learning community! You're now one step closer to achieving your educational goals.</p>
        <p>Start exploring our courses and begin your learning journey today.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/courses" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Browse Courses</a>
        </div>
        <p>Best regards,<br>The EduLearn Team</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 0.8em; color: #777;">This email was sent to you because you signed up for an account on EduLearn. If you didn't sign up, please ignore this email.</p>
      </body>
    </html>
  `,n=(e="there",r)=>`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset Request</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6;">Password Reset</h1>
        </div>
        <p>Hello ${e},</p>
        <p>You requested a password reset for your EduLearn account. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${r}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <p>Best regards,<br>The EduLearn Team</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 0.8em; color: #777;">This email was sent to you because a password reset was requested for your EduLearn account.</p>
      </body>
    </html>
  `,l=(e="there",r)=>`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Email Verification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6;">Verify Your Email</h1>
        </div>
        <p>Hello ${e},</p>
        <p>Thank you for signing up with EduLearn! Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${r}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
        </div>
        <p>If you didn't create an account with us, you can safely ignore this email.</p>
        <p>Best regards,<br>The EduLearn Team</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 0.8em; color: #777;">This email was sent to you because a new account was created on EduLearn.</p>
      </body>
    </html>
  `},57327:(e,r,t)=>{t.d(r,{OQ:()=>o});let o=(0,t(23950).eI)(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:!0,autoRefreshToken:!0,detectSessionInUrl:!0},headers:{"x-application-name":"EduLearn Platform"}})}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),o=r.X(0,[1638,7552,8070,5180],()=>t(12021));module.exports=o})();