using System;
using System.IO;
using System.Net;
#pragma warning disable 0168 // variable declared but not used.
#pragma warning disable 0219 // variable assigned but not used.
#pragma warning disable 0414 // private field assigned but not used.

class main{

    public static void Main()
    {
        //WATCH FOR PNG FILES IN SHADOWPLAY
        FileSystemWatcher watcher5 = new FileSystemWatcher();
        watcher5.Path = "A:\\Users\\temp\\Videos\\ShadowPlay videos";
        watcher5.NotifyFilter = NotifyFilters.LastAccess | NotifyFilters.LastWrite | NotifyFilters.FileName | NotifyFilters.DirectoryName;
        //if you want to filter file types
        watcher5.Filter = "*.png";
        watcher5.Created += new FileSystemEventHandler(moveFile);
        watcher5.IncludeSubdirectories = true;
        watcher5.EnableRaisingEvents = true;

         //WATCH FOR PNG FILES IN STO
        FileSystemWatcher watcher = new FileSystemWatcher();
        watcher.Path = "A:\\Program Files (x86)\\Steam\\steamapps\\common\\Star Trek Online\\Star Trek Online\\Live\\screenshots";
        watcher.NotifyFilter = NotifyFilters.LastAccess | NotifyFilters.LastWrite | NotifyFilters.FileName | NotifyFilters.DirectoryName;
        //if you want to filter file types
        watcher.Filter = "*.jpg";
        watcher.Created += new FileSystemEventHandler(moveFile);
        watcher.IncludeSubdirectories = true;
        watcher.EnableRaisingEvents = true;

        //WATCH FOR VIDEOS
        /*
        FileSystemWatcher watcher2 = new FileSystemWatcher();
        watcher2.Path = "C:\\Users\\temp\\Videos\\ShadowPlay videos";
        watcher2.NotifyFilter = NotifyFilters.LastAccess | NotifyFilters.LastWrite | NotifyFilters.FileName | NotifyFilters.DirectoryName;
        //if you want to filter file types
        watcher2.Filter = "*.mp4";
        watcher2.Created += new FileSystemEventHandler(createSym);
        watcher2.IncludeSubdirectories = true;
        watcher2.EnableRaisingEvents = true;
        */

        Console.WriteLine("Press \'q\' to quit.");
        while(Console.Read()!='q');
    }

    static void createSym(object source, FileSystemEventArgs e){
        System.Diagnostics.Process process = new System.Diagnostics.Process();
            System.Diagnostics.ProcessStartInfo startInfo = new System.Diagnostics.ProcessStartInfo();
            startInfo.WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden;
            startInfo.FileName = "cmd.exe";
            startInfo.Arguments = "/C mklink /H \"C:\\Users\\temp\\Videos\\Captures\\" + e.Name + "\" \"" + e.FullPath + "\"";
            process.StartInfo = startInfo;
            process.Start();
            Console.WriteLine("mklink /H \"C:\\Users\\temp\\Videos\\Captures\\" + e.Name + "\" \"" + e.FullPath + "\"");
    }

    static void moveFile(object source, FileSystemEventArgs e){
        System.Threading.Thread.Sleep(1000);
        char[] chars = {'/','\\'};
        string[] file = e.Name.Split(chars);
        try{
            string destinationFile = "A:/Users/temp/Pictures/screenshots/" + file[1];
            string sourceFile = e.FullPath;
            System.IO.File.Move(sourceFile, destinationFile);
            Console.WriteLine("Moved " + file[1] + " to C:\\Users\\temp\\Pictures\\screenshots\\");
        }
        catch(Exception ee){
            string destinationFile = "C:/Users/temp/Pictures/screenshots/" + file[0];
        string sourceFile = e.FullPath;
        System.IO.File.Move(sourceFile, destinationFile);
        Console.WriteLine("Moved " + file[0] + " to C:\\Users\\temp\\Pictures\\screenshots\\");
        }
        
    }
}