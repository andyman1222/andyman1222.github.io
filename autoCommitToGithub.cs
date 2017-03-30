using System;
using System.IO;
using System.Net;
using System.Diagnostics;

class main{
    static Process process1 = new Process();
    static Process process2 = new Process();
    static Process process3 = new Process();
    public static void Main(){

        process1.StartInfo.UseShellExecute = false;
        process1.StartInfo.FileName = "git";
        process1.StartInfo.CreateNoWindow = true;
        process1.StartInfo.RedirectStandardOutput = true;
        process1.StartInfo.RedirectStandardError = true;

        process2.StartInfo.UseShellExecute = false;
        process2.StartInfo.FileName = "git";
        process2.StartInfo.CreateNoWindow = true;
        process2.StartInfo.RedirectStandardOutput = true;
        process2.StartInfo.RedirectStandardError = true;

        process3.StartInfo.UseShellExecute = false;
        process3.StartInfo.FileName = "git";
        process3.StartInfo.Arguments = "push";
        process3.StartInfo.CreateNoWindow = true;
        process3.StartInfo.RedirectStandardOutput = true;
        process3.StartInfo.RedirectStandardError = true;

        FileSystemWatcher watcher = new FileSystemWatcher();
        watcher.Path = Directory.GetCurrentDirectory();
        watcher.NotifyFilter = NotifyFilters.LastAccess | NotifyFilters.LastWrite | NotifyFilters.FileName | NotifyFilters.DirectoryName;
        //if you want to filter file types
        watcher.Filter = "*.*";
        watcher.Created += new FileSystemEventHandler(Upload);
        watcher.Deleted += new FileSystemEventHandler(Delete);
        watcher.Changed += new FileSystemEventHandler(Change);
        watcher.EnableRaisingEvents = true;
        //copu-paste code above for multiple listeners

        Console.WriteLine("Press \'q\' to quit.");
        while(Console.Read()!='q');
    }
    static void Upload(object source, FileSystemEventArgs e){
        process1.StartInfo.Arguments = "add \"./" + e.Name + "\"";
        process1.Start();
        Console.WriteLine(process1.StandardOutput.ReadToEnd());
        Console.WriteLine(process1.StandardError.ReadToEnd());

        //process1.BeginOutputReadLine();
        process2.StartInfo.Arguments = "commit";
        process2.Start();
        Console.WriteLine(process2.StandardOutput.ReadToEnd());
        Console.WriteLine(process2.StandardError.ReadToEnd());
        //process2.BeginOutputReadLine();
        process3.Start();
        Console.WriteLine(process3.StandardOutput.ReadToEnd());
        Console.WriteLine(process3.StandardError.ReadToEnd());
        //process3.BeginOutputReadLine();
        Console.WriteLine("Added " + e.Name + " to git repo.");
    }
    static void Delete(object source, FileSystemEventArgs e){
        
    }
    static void Change(object source, FileSystemEventArgs e){

    }
    static void Rename(object source, FileSystemEventArgs e){

    }
}