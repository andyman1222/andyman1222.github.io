public class author{
	public String email(String answer){return answer;}
	public String name(String answer){return answer;}
	public String gender(String answer){if((answer.equals("m"))||(answer.equals("f"))){return answer;}else{System.out.println("error");return("error");}}
	public String toString(){return name("hi")+", "+gender("m")+", "+email("hi");}
}