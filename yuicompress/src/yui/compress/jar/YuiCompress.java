package yui.compress.jar;

import com.yahoo.platform.yui.compressor.CssCompressor;
import com.yahoo.platform.yui.compressor.JavaScriptCompressor;
import org.mozilla.javascript.ErrorReporter;
import org.mozilla.javascript.EvaluatorException;

import java.io.*;
import java.util.*;

public class YuiCompress {
    public static String CONFIG_PATH = "";
    public static boolean COMPRESS_JS = false;
    public static boolean COMPRESS_CSS = false;
    public static Map<String,List<String>> filesMap  =  new HashMap<String, List<String>>();

	public static void main(String[] args) throws Exception {
        try {
            CONFIG_PATH = args[0];
            Properties properties = parseProperties(CONFIG_PATH);
            String resourcesPath = properties.getProperty("resourcesPath");
            String targetResourcesPath = properties.getProperty("targetResourcesPath");
            COMPRESS_JS = Boolean.valueOf(properties.getProperty("compress_js"));
            COMPRESS_CSS = Boolean.valueOf(properties.getProperty("compress_css"));

            Iterator<Map.Entry<Object, Object>> it = properties.entrySet().iterator();
            while (it.hasNext()) {
                Map.Entry<Object, Object> entry = it.next();
                String fileName = (String)entry.getKey();
                String filePaths = (String)entry.getValue();
                if("resourcesPath".equals(fileName) || "targetResourcesPath".equals(fileName) || "compress_js".equals(fileName) || "compress_css".equals(fileName)){
                    continue;
                }
                parseJsFiles(resourcesPath, fileName, filePaths,targetResourcesPath);
            }
        }catch (Exception e){
           e.printStackTrace();
        }

	}

    private static Properties parseProperties(String configPath) throws  Exception{
        Properties prop = new Properties();
        FileInputStream fis = new FileInputStream(configPath);
        prop.load(fis);
        return prop;
    }
    private static void compressFile(String path) throws Exception{
        // TODO Auto-generated method stub
        int linebreakpos = -1;
        boolean munge = true;
        boolean verbose = false;
        boolean preserveAllSemiColons = false;
        boolean disableOptimizations = false;
        File file = new File(path);
        String fileName = file.getName();
        System.out.println(path);
        if ( (!file.exists()) || (!fileName.endsWith(".js")&&!fileName.endsWith(".css"))) {
            return;
        }
        Reader in = new FileReader(file);
        String filePath = file.getAbsolutePath();
        File tempFile = new File(filePath + ".tempFile");
        Writer out = new FileWriter(tempFile);
        if (fileName.endsWith(".js")) {
            JavaScriptCompressor jscompressor = new JavaScriptCompressor(in, new ErrorReporter() {
                public void warning(String message, String sourceName, int line, String lineSource, int lineOffset) {
                    if (line < 0) {
                        System.err.println("\n[WARNING] " + message);
                    } else {
                        System.err.println("\n[WARNING] " + line + ':' + lineOffset + ':' + message);
                    }
                }
                public void error(String message, String sourceName, int line, String lineSource, int lineOffset) {
                    if (line < 0) {
                        System.err.println("\n[ERROR] " + message);
                    } else {
                        System.err.println("\n[ERROR] " + line + ':' + lineOffset + ':' + message);
                    }
                }
                public EvaluatorException runtimeError(String message, String sourceName, int line, String lineSource, int lineOffset) {
                    error(message, sourceName, line, lineSource, lineOffset);
                    return new EvaluatorException(message);
                }
            });
            jscompressor.compress(out, linebreakpos, munge, verbose, preserveAllSemiColons, disableOptimizations);
        } else if (fileName.endsWith(".css")) {
            CssCompressor csscompressor = new CssCompressor(in);
            csscompressor.compress(out, linebreakpos);
        }
        out.close();
        in.close();
        file.delete();
        tempFile.renameTo(file);
        tempFile.delete();
    }
    private static void parseCssFiles(String resourcesPath) throws Exception{
        String cssPath = resourcesPath +File.separator + "stylesheets";
        List<File> cssFiles = new ArrayList<File>();
        cssFiles.addAll(listFiles(new File(cssPath),".css"));
        for(File file : cssFiles){
            compressFile(file.getPath());
        }

    }

    /**
     * parse the js files from resources
     *
     * @param resourcesPath resource directory
     * @param compressedFileName the final name that compressed by resource files
     * @param paths the files name string that to be compressed
     * @param compressJsPath the files name string that to be compressed
     * @throws Exception
     */
    private static void parseJsFiles(String resourcesPath,String compressedFileName,String paths,String compressJsPath) throws Exception{
        String[] arrPath = paths.split(",");
        String jsPath = resourcesPath+File.separator+"javascripts";
        File compressJsPathDir = new File(compressJsPath);
        if(!compressJsPathDir.exists()) compressJsPathDir.mkdirs();
        File compressedFile = new File(compressJsPath+File.separator+compressedFileName);
        if(compressedFile.exists()){
            compressedFile.delete();
        }
        compressedFile.createNewFile();
        List<File> jsFiles = new ArrayList<File>();
        for(int i=0;i<arrPath.length;i++){
            String jsFilePath = arrPath[i].trim();
            File jsFile = new File(jsPath + File.separator + jsFilePath);
            if(jsFile.exists()){
                if(jsFile.isDirectory()){
                    jsFiles.addAll(listFiles(jsFile,".js"));
                }else{
                    jsFiles.add(jsFile);
                }
            }
        }
        List<String> toBecompressedFileNames = new ArrayList<String>();
        for(File file : jsFiles){
            String fileName = file.getPath();
            fileName = fileName.substring(fileName.indexOf("javascripts")+"javascripts".length()+1);
            toBecompressedFileNames.add(fileName.replace("\\","/"));
            copyContent(file,compressedFile);
        }
        filesMap.put(compressedFileName,toBecompressedFileNames);
        if(COMPRESS_JS)
            compressFile(compressedFile.getPath());
    }

    /**
     * copy file content to the mix file (the only file that to be compressed by yuicompress)
     * @param src
     * @param targe
     * @throws Exception
     */
    private static void copyContent(File src,File targe) throws Exception{
        BufferedReader br = new BufferedReader(new FileReader(src));
        BufferedWriter bw = new BufferedWriter(new FileWriter(targe,true));
        String line = null;
        while ((line = br.readLine()) != null) {
            bw.write(line);
            bw.newLine();
        }
        bw.close();
    }

    /**
     * get the files in dir
     * @param dir
     * @param fileType
     * @return
     * @throws Exception
     */
    private static List<File> listFiles(File dir, final String fileType) throws Exception {
        File[] files = dir.listFiles();
        List<File> fileList = new ArrayList<File>();
        for (int x = 0; x < files.length; x++){
            if(files[x].isDirectory()){
                fileList.addAll(listFiles(files[x], fileType));
            }else if(files[x].getName().endsWith(fileType)){
                fileList.add(files[x]);
            }
        }
        return fileList;
    }
}
