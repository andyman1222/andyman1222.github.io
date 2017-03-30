import java.util.*;
import java.util.Scanner;

/**
A testerish class for binaryFunctions
@author Andy Herbert
*/

public class binaryCalculator{
    static List<Long> bytes = new ArrayList<Long>();
    static int valueToPrint = 0;
    static String input;
    static Scanner scanner = new Scanner(System.in);
    static int binaryOrDecimal;
    static binaryFunctions claculator = new binaryFunctions();

    public static void main(String[] args){
        bytes = new ArrayList<Long>();
        
        while(true){
            System.out.println("Binary or decimal? Type 1 for binary->decimal and 0 for decimal->binary. Will default to decimal if incorrect/no value inserted.");
            try{
                String binaryOrDecimal = scanner.nextLine();
                input = "";
                if(binaryOrDecimal.equals("0")){
                    System.out.println("Enter the value that you want to convert:");
                    input = scanner.nextLine();
                    bytes = new binaryFunctions().numberToByte(Long.parseLong(input));
                    System.out.println(new binaryFunctions().toLong(bytes));

                }
                else{
                    System.out.println("Enter the value that you want to convert (nonzero bit will default to 1):");
                    input = "";
                    input = scanner.nextLine();
                    //debug: System.out.println(new binaryFunctions().toList(input));
                    System.out.println(new binaryFunctions().byteToNumber(new binaryFunctions().reverseOrder(new binaryFunctions().toList(input))));
                }
                
            }
            catch(Exception e){
                System.out.println("\n\nEnter correct values only!\n");   
            }
        }
    }
}