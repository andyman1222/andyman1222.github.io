using System.IO;
using System;
using System.Collections;

#pragma warning disable 0168 // variable declared but not used.
#pragma warning disable 0219 // variable assigned but not used.
#pragma warning disable 0414 // private field assigned but not used.

class main{
    public static void Main(string[] args){
        String dir = Directory.GetCurrentDirectory();
        String[] files = Directory.GetFiles(dir);
        ArrayList errFiles = new ArrayList();
        int i = 0;
       foreach(String file in files){
           if(file.Contains(".png")||file.Contains(".jpg")){
               Console.WriteLine(file);
               DateTime createDate = new DateTime();
               String date = "";
               try{
                   if(file.Contains("Screenshot_")){
                        date = file.Substring(file.Length-19);
                        date = date.Substring(0, date.Length-4);
                        Console.WriteLine(date);
                        createDate = DateTime.ParseExact(date, "yyyyMMdd-HHmmss", System.Globalization.CultureInfo.InvariantCulture);
                    }
                    else if(file.Contains("screenshot_")||file.Contains("GTRacing2_")){
                        date = file.Substring(file.Length-23);
                        date = date.Substring(0, date.Length-4);
                        Console.WriteLine(date);
                        createDate = DateTime.ParseExact(date, "yyyy-MM-dd-HH-mm-ss", System.Globalization.CultureInfo.InvariantCulture);
                    }
                    else if(file.Contains("Star Wars  Battlefront (2015)")||file.Contains("Overwatch")||file.Contains("Desktop")){
                        date = file.Substring(file.Length-28);
                        date = date.Substring(0, date.Length-7);
                        Console.WriteLine(date);
                        createDate = DateTime.ParseExact(date, "MM.dd.yyyy - HH.mm.ss", System.Globalization.CultureInfo.InvariantCulture);
                    }
                    else if(file.Contains("Spark_")){
                        date = file.Substring(file.Length-23,19);
                        Console.WriteLine(date);
                        createDate = DateTime.ParseExact(date, "yyyy-MM-dd_HH-mm-ss", System.Globalization.CultureInfo.InvariantCulture);
                    }
                    else if(file.Contains("PPSSPP_")){
                        date = file.Substring(file.Length-19);
                        date = date.Substring(0, date.Length-4);
                        Console.WriteLine(date);
                        createDate = DateTime.ParseExact(date, "yyyyMMdd_HHmmss", System.Globalization.CultureInfo.InvariantCulture);
                    }
                    else if(file.Contains("_000")){
                        String[] dateParsed = file.Split('\\');
                        date = dateParsed[dateParsed.Length-1].Substring(0, 10);
                        Console.WriteLine(date);
                        createDate = DateTime.ParseExact(date, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture);
                    }
                    else if(file.Contains("_1")){
                        date = file.Substring(file.Length-20, 14);
                        Console.WriteLine(date);
                        createDate = DateTime.ParseExact(date, "yyyyMMddHHmmss", System.Globalization.CultureInfo.InvariantCulture);
                    }
                    else{
                        Console.WriteLine(file + " was unable to change date. Unknown format.");
                        errFiles.Add(file + " (unknown format.)");
                        i++;
                    }
                    File.SetCreationTime(file, createDate);
                    File.SetLastWriteTime(file, createDate);
               }
               catch(Exception e){
                   Console.WriteLine(file + "\nunable to change date. Error: " + e.ToString());
                   errFiles.Add(file + " (error. Attempted to parse " + date + ")");
                   i++;
               }
           }
       }
       Console.WriteLine("Done with date changing. " + i + " files were unable to change:");
       foreach(String file in errFiles){
           if(!file.Equals("")){
               Console.WriteLine(file);
           }
       }
       while(true){}
    }
}