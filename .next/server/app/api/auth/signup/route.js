"use strict";(()=>{var e={};e.id=3654,e.ids=[3654],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6113:e=>{e.exports=require("crypto")},6005:e=>{e.exports=require("node:crypto")},33170:(e,r,t)=>{t.r(r),t.d(r,{headerHooks:()=>f,originalPathname:()=>b,patchFetch:()=>w,requestAsyncStorage:()=>h,routeModule:()=>m,serverHooks:()=>y,staticGenerationAsyncStorage:()=>g,staticGenerationBailout:()=>x});var a={};t.r(a),t.d(a,{POST:()=>p});var o=t(95419),s=t(69108),i=t(99678),n=t(78070),l=t(57327),d=t(81826),u=t(6521),c=t.n(u);async function p(e){let{name:r,email:t,password:a,role:o}=await e.json();if(!r||!t||!a)return n.Z.json({error:"Name, email, and password are required"},{status:400});if(a.length<6)return n.Z.json({error:"Password must be at least 6 characters long"},{status:400});if(!["student","instructor"].includes(o))return n.Z.json({error:"Invalid role specified"},{status:400});try{let{data:e,error:s}=await l.OQ.from("users").select("*").eq("email",t).single();if(e)return n.Z.json({error:"User already exists with this email"},{status:400});let i=await c().hash(a,10),{data:u,error:p}=await l.OQ.from("users").insert([{email:t,name:r,role:o,password:i}]).select().single();if(p)return console.error("Error creating user:",p),n.Z.json({error:"Error creating user account"},{status:500});try{await (0,d.Cz)({to:t,subject:"Welcome to EduLearn!",template:"welcome",data:{name:r}})}catch(e){console.error("Error sending welcome email:",e)}return n.Z.json({message:"User created successfully",user:{id:u.id,email:u.email,name:u.name,role:u.role}},{status:201})}catch(e){return console.error("Error in signup API:",e),n.Z.json({error:"An error occurred during signup"},{status:500})}}let m=new o.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/auth/signup/route",pathname:"/api/auth/signup",filename:"route",bundlePath:"app/api/auth/signup/route"},resolvedPagePath:"C:\\Users\\mhx_x\\Documents\\Project\\relearning\\src\\app\\api\\auth\\signup\\route.ts",nextConfigOutput:"standalone",userland:a}),{requestAsyncStorage:h,staticGenerationAsyncStorage:g,serverHooks:y,headerHooks:f,staticGenerationBailout:x}=m,b="/api/auth/signup/route";function w(){return(0,i.patchFetch)({serverHooks:y,staticGenerationAsyncStorage:g})}},81826:(e,r,t)=>{t.d(r,{Cz:()=>s});var a=t(75180);t(6113);let o=new a.R(process.env.RESEND_API_KEY),s=async({to:e,subject:r,template:t,data:a})=>{try{let s="";switch(t){case"welcome":s=i(a?.name);break;case"passwordReset":s=n(a?.name,a?.resetLink);break;case"emailVerification":s=l(a?.name,a?.verificationLink);break;default:throw Error("Invalid email template")}let{data:d,error:u}=await o.emails.send({from:"onboarding@edulearn-platform.com",to:e,subject:r,html:s});if(u)throw console.error("Email sending error:",u),Error(`Failed to send email: ${u.message}`);return{success:!0,id:d?.id}}catch(e){throw console.error("Error sending email:",e),Error(`Email sending failed: ${e.message}`)}},i=(e="there")=>`
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
  `},57327:(e,r,t)=>{t.d(r,{OQ:()=>a});let a=(0,t(23950).eI)(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:!0,autoRefreshToken:!0,detectSessionInUrl:!0},headers:{"x-application-name":"EduLearn Platform"}})}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),a=r.X(0,[1638,7552,8070,6521,5180],()=>t(33170));module.exports=a})();