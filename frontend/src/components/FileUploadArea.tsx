import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';

registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

interface FileUploadAreaProps {
  onUpdateFiles: (files: any[]) => void;
}

export function FileUploadArea({ onUpdateFiles }: FileUploadAreaProps) {
  return (
    <FilePond
      onupdatefiles={onUpdateFiles}
      allowMultiple={true}
      maxFiles={100}
      maxFileSize="10MB"
      name="cvs"
      labelIdle='<span class="font-semibold">Drag & Drop your CVs</span> or <span class="filepond--label-action">Browse</span>'
      acceptedFileTypes={[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
      ]}
      credits={false}
    />
  );
}