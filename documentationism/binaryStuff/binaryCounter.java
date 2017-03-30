import java.util.*;

/**
Counts up from 0 to the max size of a String or ArrayList<Integer> in binary and decodes
@author Andy Herbert
*/

class binaryCounter{
    static List<Integer> bytes = new ArrayList<Integer>();
    static int valueToPrint = 0;

    public static void main(String[] args){
        bytes.add(0);
        while(true){
            System.out.println(byteToNumber());
            countUp(0);
            
        }
    }

    /**
    adds 1 (non-binary 1) to a binary variable in the form on List<Integer>
    @param numberToCheck the index of bytes to shift in bytes. Usually set this to 0
    */
    static void countUp(int numberToCheck){
        if(bytes.get(numberToCheck) == 0){
            bytes.set(numberToCheck,1);
        }
        else{
            if(bytes.size()==numberToCheck+1){
                bytes.add(1);
                bytes.set(numberToCheck,0);
            }
            else{
                bytes.set(numberToCheck,0);
                countUp(numberToCheck+1);
            }
        }
    }

    /**
    converts array (type list) of binary digits to base-10
    @return a number in the form of a string that is the decoded bytes
    */
    public static String byteToNumber(){
        int i = 0;
        int spacePlace = 0;
        String stuffToPrint = "";
        String xtra0s = "";
        valueToPrint = 0;
        for(Integer currentByte : bytes){
            int tempValue = 2;
            if(currentByte == 1){
                if(i == 0){
                    tempValue = 1;
                }
                else{
                    for(int x = 1; x < i; x++){
                        tempValue = tempValue * 2;
                    }
                }
                valueToPrint+= tempValue;
            }
            
            stuffToPrint+= bytes.get(i);
            i++;
            spacePlace++;
            if(spacePlace == 8){
                spacePlace = 0;
                stuffToPrint += " ";
            }
        }
        for(int ii = 8-(i%8);ii!=8&&ii>0;ii--){
            xtra0s+="0";
        }
        stuffToPrint+= xtra0s;
        return stuffToPrint + " = " + valueToPrint;
    }
}