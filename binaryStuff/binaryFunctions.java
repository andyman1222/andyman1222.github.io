import java.util.*;

/**
@author Andy Herbert

Various functions to help compute, decode/encode binary digits.
TODO: add support for hexadecimal?
*/

public class binaryFunctions{

    /**
    converts a String to java.util.ArrayList which is used to handle binary in pieces.
    @param number the number (in the form of a String) to convert to ArrayList
    @return the converted ArrayList
    */

    public List<Long> toList(String number){
        String numberS = number + "";
        List<Long> temp = new ArrayList<Long>();
        for(int i = 0; i < numberS.length(); i++){
            temp.add(Long.parseLong(""+numberS.charAt(i)));
        }
        return temp;
    }

    /**
    Converts an ArrayList to a long for easy printing.
    @param number the ArrayList to be converted
    @return a long
    */

    public long toLong(List<Long> number){
        String temp = "";
        for(int i = 0; i < number.size(); i++){
            temp += number.get(i) + "";
        }
        return Long.parseLong(temp);
    }

    /**
    Converts a number into binary in the form of ArrayList.
    @param number the Long to convert to binary/ArrayList
    @return the binary form of number, as an ArrayList
    */

    public List<Long> numberToByte(long number){
        List<Long> answer = new ArrayList<Long>();
        long divisor = 1;
        if(number<=0){
            for(long i = 0; i < 8; i++){
                answer.add((long)0);
            }
        }
        else{
            for(divisor = 1; divisor < number; divisor*=2){}
            for(; divisor > 1; divisor=divisor/2){
                if(number/divisor>=1){
                    answer.add((long)1);
                    number %= divisor;
                }
                else{
                    answer.add((long)0);
                }
            }
            if(number == 1){
                answer.add((long)1);
            }
            else{
                answer.add((long)0);
            }
        }
        return answer;
    }

    /**
    Reverses the order of ArrayList.
    @param input the ArrayList to reverse
    @return the reversed ArrayList
    */

    public List<Long> reverseOrder(List<Long> input){
        List<Long> reverse = new ArrayList<Long>();
        for(int i = input.size()-1; i >=0; i--){
            reverse.add((long)input.get(i));
        }
        return reverse;
    }

    /**
    converts binary digits (in the form of java.util.ArrayList) to a long. Use toList(number) to convert a binary long to an ArrayList.
    @param bytes the binary digits to convert into a long.
    @return the converted long
    */

    public long byteToNumber(List<Long> bytes){
        long loop = 0;
        long spacePlace = 0;
        String stuffToPrint = "";
        String xtra0s = "";
        long valueToPrint = 0;
        for(Long currentByte : bytes){
            long tempValue = 2;

            if(currentByte != 0){
                if(loop == 0){
                    tempValue = 1;
                }
                else{
                    for(int x = 1; x < loop; x++){
                        tempValue*= 2;
                    }
                }
                valueToPrint+= tempValue;
            }
            
            loop++;
        }
        stuffToPrint+= xtra0s;
        return valueToPrint;
    }
}