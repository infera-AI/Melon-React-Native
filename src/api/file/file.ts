import http from '../../utils/http'
import { API_ENDPOINTS } from '../apiPath';

// 上传文件接口
export function uploadFiles(params: { files: any }) {
  const formData = new FormData();
  params.files.forEach((file: any) => {
    formData.append(`files`, {
      uri: file.uri,
      name: file.name,
      type: file.type,
    });
  });
  return http.post<any>(API_ENDPOINTS.FILE.UPLOAD_FILE, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}
