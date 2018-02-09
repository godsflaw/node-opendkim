#ifndef _OPENDKIMASYNC_H_
#define _OPENDKIMASYNC_H_

#include "opendkim.h"

//
// OpenDKIM Async Worker Base Class
//

using namespace std;
using namespace v8;
using namespace Nan;
using namespace opendkim;

class OpenDKIMAsyncWorker : public Nan::AsyncWorker {
  public:
    OpenDKIMAsyncWorker(Nan::Callback* callback) : Nan::AsyncWorker(callback), result(NULL) {};

    // Implement virtual function from NAN interface
    void HandleErrorCallback() {
      Nan::HandleScope scope;

      v8::Local<v8::Value> argv[] = {
          Nan::Error(result),
          Nan::Undefined()
      };
      callback->Call(2, argv);
    }

    // Implement virtual function from NAN interface
    void WorkComplete() {
      Nan::HandleScope scope;

      if (result == NULL) {
        HandleOKCallback();
      } else {
        HandleErrorCallback();
      }

      delete callback;
      callback = NULL;
    }

  protected:
    const char *result;
    OpenDKIM *obj;
};

#endif /* _OPENDKIMASYNC_H_ */
