#ifndef LIBOPENDKIM_H
#define LIBOPENDKIM_H

#if __GNUC__ > 4
#define _Bool bool
#endif

#include <iostream>
#include <stdlib.h>
#include <string.h>
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
    static NAN_METHOD(LibFeature);

    // Processing methods
    static NAN_METHOD(Header);
    static NAN_METHOD(HeaderSync);
    static const char *HeaderArgs(
      Nan::NAN_METHOD_ARGS_TYPE info,
      OpenDKIM **obj,
      char **header,
      int *length
    );
    static const char *HeaderBase(
      OpenDKIM *obj,
      char *header,
      int length
    );

    static NAN_METHOD(EOH);
    static NAN_METHOD(EOHSync);
    static const char *EOHBase(OpenDKIM *obj);

    static NAN_METHOD(Body);
    static NAN_METHOD(BodySync);
    static const char *BodyArgs(
      Nan::NAN_METHOD_ARGS_TYPE info,
      OpenDKIM **obj,
      char **body,
      int *length
    );
    static const char *BodyBase(
      OpenDKIM *obj,
      char *body,
      int length
    );

    static NAN_METHOD(EOM);
    static NAN_METHOD(EOMSync);
    static const char *EOMArgs(
      Nan::NAN_METHOD_ARGS_TYPE info,
      OpenDKIM **obj,
      bool *returntest
    );
    static const char *EOMBase(OpenDKIM *obj, bool returntest, bool *testkey);

    static NAN_METHOD(Chunk);
    static NAN_METHOD(ChunkSync);
    static const char *ChunkArgs(
      Nan::NAN_METHOD_ARGS_TYPE info,
      OpenDKIM **obj,
      char **message,
      int *length
    );
    static const char *ChunkBase(
      OpenDKIM *obj,
      char *message,
      int length
    );

    static NAN_METHOD(ChunkEnd);

    // Signing methods
    static NAN_METHOD(Sign);
    static NAN_METHOD(SignSync);
    static const char *SignArgs(
      Nan::NAN_METHOD_ARGS_TYPE info,
      OpenDKIM **obj,
      char **id,
      char **secretkey,
      char **selector,
      char **domain,
      char **hdrcanon,
      char **bodycanon,
      char **signalg,
      int *length
    );
    static const char *SignBase(
      OpenDKIM *obj,
      char *id,
      char *secretkey,
      char *selector,
      char *domain,
      char *hdrcanon,
      char *bodycanon,
      char *signalg,
      int length
    );

    // Utility methods
    static NAN_METHOD(GetOption);
    static NAN_METHOD(SetOption);

    // Verifying methods
    static NAN_METHOD(GetSignature);
    static NAN_METHOD(OHDRS);
    static NAN_METHOD(SigGetIdentity);
    static NAN_METHOD(SigGetDomain);
    static NAN_METHOD(SigGetSelector);
    static NAN_METHOD(SigGetError);
    static NAN_METHOD(SigGetErrorStr);
    static NAN_METHOD(Verify);

  private:
    explicit OpenDKIM();
    ~OpenDKIM();

    static inline Nan::Persistent<v8::Function> &constructor() {
      static Nan::Persistent<v8::Function> my_constructor;
      return my_constructor;
    }

    static inline const char *get_error(DKIM_STAT result) {
      const char *msg = dkim_getresultstr(result);

      if (msg != NULL) {
         return msg;
      } else {
        return "an unknown error occurred";
      }
    }

    static inline void throw_error(DKIM_STAT result) {
      Nan::ThrowError(get_error(result));
    }

    // The user of this function must free retval in the caller if the function
    // return success.
    static inline int _value_to_char(v8::Local<v8::Value> obj, const char *key, char **retval) {
      Local<Value> val = Nan::Get(
        obj.As<Object>(), Nan::New(key).ToLocalChecked()
      ).ToLocalChecked();
      Nan::Utf8String str(val);
      char *strval = *str;

      int val_size = strlen(strval);
      *retval = (char *)malloc(sizeof(char) * (val_size + 1));
      if(*retval == NULL) {
        Nan::ThrowTypeError("_value_to_char: out-of-memory");
        return 0;
      }
      memcpy(*retval, strval, val_size);
      (*retval)[val_size] = '\0';

      if (strcmp(*retval, "undefined") == 0) {
        _safe_free(&(*retval));
        return 0;
      } else {
        return 1;
      }
    }

    static inline int _value_to_int(v8::Local<v8::Value> obj, const char *key) {
      Local<Value> val = Nan::Get(
        obj.As<Object>(), Nan::New(key).ToLocalChecked()
      ).ToLocalChecked();
      return val->Int32Value();
    }

    static inline bool _value_to_bool(v8::Local<v8::Value> obj, const char *key) {
      Local<Value> val = Nan::Get(
        obj.As<Object>(), Nan::New(key).ToLocalChecked()
      ).ToLocalChecked();
      return val->BooleanValue();
    }

    static inline void _safe_free(char **ptr) {
      if (*ptr != NULL) {
        free(*ptr);
        *ptr = NULL;
      }
    }

    // private variables
    DKIM *dkim;
    DKIM_SIGINFO *sig;
};

}

#endif
