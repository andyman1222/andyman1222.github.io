import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class FileReadExample {

    public static void main(String[] args) {

        try{
            String verify, putData;
            File file = new File("file.txt");
            file.createNewFile();
            FileWriter fw = new FileWriter(file);
            BufferedWriter bw = new BufferedWriter(fw);
            bw.write("Some text here for a reason");
            bw.flush();
            bw.close();
            FileReader fr = new FileReader(file);
            BufferedReader br = new BufferedReader(fr);
			br.read("file.txt");
            while( br.readLine() != null ){
                verify = br.readLine();
				System.out.println(verify);
                if(verify != null){
                    putData = verify.replaceAll("here", "there");
                    bw.write(putData);
                }
            }
            br.close();


        }catch(IOException e){
        e.printStackTrace();
        }
    }

}