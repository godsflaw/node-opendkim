#ifndef LIBOPENDKIM_H
#define LIBOPENDKIM_H

#include <iostream>
#include <node.h>
#include <nan.h>
#include <node_object_wrap.h>
#include <stdbool.h>
#include <opendkim/dkim.h>

namespace opendkim {

using namespace std;
using namespace v8;
using namespace Nan;

class OpenDKIM : public Nan::ObjectWrap {
  public:
    static NAN_MODULE_INIT(Init);

    // Administration methods
    static NAN_METHOD(New);
    static NAN_METHOD(FlushCache);

    // Signing methods
    static NAN_METHOD(Sign);

    // Verifying methods
    static NAN_METHOD(Verify);

  private:
    explicit OpenDKIM();
    ~OpenDKIM();

    static inline Nan::Persistent<v8::Function> &constructor() {
      static Nan::Persistent<v8::Function> my_constructor;
      return my_constructor;
    }

    static inline void throw_error(DKIM_STAT result) {
      const char *msg = dkim_getresultstr(result);

      if (msg != NULL) {
        Nan::ThrowError(msg);
      } else {
        Nan::ThrowError("sign(): an unknown error occurred");
      }

      return;
    }

    static inline char *_value_to_char(v8::Local<v8::Value> obj, const char *key) {
      Local<Value> val = Nan::Get(
        obj.As<Object>(), Nan::New(key).ToLocalChecked()
      ).ToLocalChecked();
      Nan::Utf8String str(val);
      char *retval = *str;

      if (strcmp(retval, "undefined") == 0) {
        return NULL;
      } else {
        return retval;
      }
    }

    static inline int _value_to_int(v8::Local<v8::Value> obj, const char *key) {
      Local<Value> val = Nan::Get(
        obj.As<Object>(), Nan::New(key).ToLocalChecked()
      ).ToLocalChecked();
      return val->Int32Value();
    }

    // private variables
    DKIM *dkim;
    DKIM_LIB *dkim_lib;
};

}

#endif
