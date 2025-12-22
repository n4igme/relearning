"use strict";(()=>{var e={};e.id=209,e.ids=[209],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},44281:(e,r,t)=>{t.r(r),t.d(r,{headerHooks:()=>m,originalPathname:()=>_,patchFetch:()=>v,requestAsyncStorage:()=>d,routeModule:()=>l,serverHooks:()=>h,staticGenerationAsyncStorage:()=>p,staticGenerationBailout:()=>g});var s={};t.r(s),t.d(s,{GET:()=>c});var a=t(95419),o=t(69108),n=t(99678),i=t(78070),u=t(57327);async function c(e){try{let{searchParams:r}=new URL(e.url),t=r.get("q"),s=parseInt(r.get("limit")||"20");if(!t||t.trim().length<2)return i.Z.json({error:'Query parameter "q" must be at least 2 characters long'},{status:400});let{data:a,error:o}=await u.OQ.from("courses").select(`
        id,
        title,
        description,
        category,
        level,
        price,
        thumbnail_url,
        published,
        created_at,
        instructor_id,
        users:instructor_id (id, name, avatar_url),
        enrollments!inner (id),
        reviews (rating)
      `).eq("published",!0).or(`title.ilike.%${t}%,description.ilike.%${t}%,category.ilike.%${t}%`).limit(s);if(o)return console.error("Error in course search API:",o),i.Z.json({error:"Failed to search courses"},{status:500});let n=a.map(e=>{let r=e.reviews||[],t=r.length>0?r.reduce((e,r)=>e+r.rating,0)/r.length:0;return{...e,instructor_name:e.users?.name,instructor_avatar:e.users?.avatar_url,rating:t,review_count:r.length}});return i.Z.json({results:n,count:n.length},{status:200})}catch(e){return console.error("Error in course search API:",e),i.Z.json({error:"An error occurred while searching courses"},{status:500})}}let l=new a.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/courses/search/route",pathname:"/api/courses/search",filename:"route",bundlePath:"app/api/courses/search/route"},resolvedPagePath:"C:\\Users\\mhx_x\\Documents\\Project\\relearning\\src\\app\\api\\courses\\search\\route.ts",nextConfigOutput:"standalone",userland:s}),{requestAsyncStorage:d,staticGenerationAsyncStorage:p,serverHooks:h,headerHooks:m,staticGenerationBailout:g}=l,_="/api/courses/search/route";function v(){return(0,n.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:p})}},57327:(e,r,t)=>{t.d(r,{OQ:()=>s});let s=(0,t(23950).eI)(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:!0,autoRefreshToken:!0,detectSessionInUrl:!0},headers:{"x-application-name":"EduLearn Platform"}})}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[1638,7552,8070],()=>t(44281));module.exports=s})();