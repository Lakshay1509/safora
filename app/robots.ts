import { MetadataRoute } from "next";
export default function robot():MetadataRoute.Robots{
    return {
        rules:{
            userAgent:'*',
            allow:'/',
            disallow:['/api','/auth']
        },
        sitemap:'https://www.safeornot.space/sitemap.xml',
    } 
}